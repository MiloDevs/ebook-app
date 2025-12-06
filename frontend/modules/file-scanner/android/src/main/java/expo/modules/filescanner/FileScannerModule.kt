package expo.modules.filescanner

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import android.os.Environment
import android.os.Build
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.annotation.RequiresApi

import java.io.File
import java.net.URL

// --- MediaStore Imports ---
import android.provider.MediaStore // Key import for MediaStore
import android.database.Cursor // Needed for handling query results

class FileScannerModule : Module() {

    // --- MODULE DEFINITION ---
    override fun definition() = ModuleDefinition {

        Name("FileScanner")

        // Retaining basic Expo Module API components
        Constant("PI") { Math.PI }
        Events("onChange")
        Function("hello") { "Hello world! 👋" }
        AsyncFunction("setValueAsync") { value: String ->
            sendEvent("onChange", mapOf("value" to value))
        }

        // --- MANAGE_EXTERNAL_STORAGE PERMISSION FUNCTIONS (Unchanged) ---

        // 1. Check if "All Files Access" is granted (API 30+)
        AsyncFunction("hasAllFilesAccessPermission") {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                return@AsyncFunction isExternalStorageManagerR()
            }
            return@AsyncFunction true
        }

        // 2. Request permission by opening the system settings
        AsyncFunction("requestAllFilesAccessPermission") {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                requestAllFilesAccessPermissionR()
            } else {
                throw Exception("All Files Access is not required or available on API < 30.")
            }
        }

        // 3. Search function - OPTIMIZED WITH MEDIASTORE
        AsyncFunction("searchExternalStorage") { extension: String ->
            // Pre-scan permission check for API 30+ (still necessary for full access on new devices)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if (!isExternalStorageManagerR()) {
                    throw Exception("MANAGE_EXTERNAL_STORAGE permission not granted.")
                }
            }

            // Call the fast, MediaStore-based search
            return@AsyncFunction mediaStoreSearch(extension)
        }

        // Retaining View definition (remove if your module is only for file scanning)
        View(FileScannerView::class) {
            Prop("url") { view: FileScannerView, url: URL ->
                view.webView.loadUrl(url.toString())
            }
            Events("onLoad")
        }
    }

    // --- OPTIMIZED MEDIASTORE SEARCH LOGIC ---
    private fun mediaStoreSearch(extension: String): List<String> {
        val context = appContext.reactContext ?: throw Exception("Context not available")
        val filesList = mutableListOf<String>()
        val extLower = extension.lowercase()

        // 1. Define the URI for all external files
        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10 (Q) and higher uses VOLUME_EXTERNAL
            MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            // Older Android versions
            MediaStore.Files.getContentUri("external")
        }

        // 2. Define the columns to retrieve (we only need the file path/data)
        val projection = arrayOf(
            MediaStore.Files.FileColumns.DATA
        )

        // 3. Define the WHERE clause: Find files where the _data column ends with the extension.
        val selection = "${MediaStore.Files.FileColumns.DATA} LIKE ?"
        val selectionArgs = arrayOf("%.$extLower") // e.g., '%.mp4' or '%.pdf'

        // 4. Query the ContentResolver
        // The 'use' block ensures the cursor is closed after use, preventing leaks.
        context.contentResolver.query(
            collection,
            projection,
            selection,
            selectionArgs,
            null // No specific sort order needed for this use case
        )?.use { cursor ->
            // Check if the cursor is valid and retrieve the column index for the path
            val pathColumnIndex = cursor.getColumnIndex(MediaStore.Files.FileColumns.DATA)

            if (pathColumnIndex != -1) {
                while (cursor.moveToNext()) {
                    val filePath = cursor.getString(pathColumnIndex)
                    // The path returned is the absolute path, which is what the original function provided.
                    filesList.add(filePath)
                }
            }
        }

        return filesList
    }

    // --- NATIVE API 30+ FUNCTIONS (Unchanged) ---

    @RequiresApi(Build.VERSION_CODES.R)
    private fun isExternalStorageManagerR(): Boolean {
        return Environment.isExternalStorageManager()
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun requestAllFilesAccessPermissionR() {
        val context = appContext.reactContext ?: throw Exception("Context not available")

        val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) // Crucial for non-activity context

        val uri = Uri.fromParts("package", context.packageName, null)
        intent.data = uri

        context.startActivity(intent)
    }

    // NOTE: The previous recursiveSearch function is removed entirely as it is now obsolete.
}
