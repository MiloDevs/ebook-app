-- This script creates a default library for existing users
-- Run this manually in your database after the migration
INSERT INTO
    library (
        id,
        name,
        description,
        is_default,
        user_id,
        created_at,
        updated_at
    )
SELECT
    gen_random_uuid (),
    'My Library',
    'Your default reading list',
    true,
    id,
    NOW (),
    NOW ()
FROM
    "user"
WHERE
    id NOT IN (
        SELECT DISTINCT
            user_id
        FROM
            library
        WHERE
            is_default = true
    );