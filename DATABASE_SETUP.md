# Database Setup Guide

This guide explains how to set up the database tables for the Venture Growth Hub Portal.

## Required Tables

The application requires the following database tables to function properly:

### 1. Users Table (`users_schema.sql`)
- Stores user profiles and authentication data
- Contains user roles, KYC status, and profile information
- Includes sample data for testing

### 2. Opportunities Table (`opportunities_schema.sql`)
- Stores investment opportunities created by entrepreneurs
- Contains opportunity details, funding goals, and status
- Includes sample data for testing

### 3. Investments Table (`investments_schema.sql`)
- Tracks individual investments made by investors
- Links investors to opportunities with amounts and status
- Includes sample data for testing

### 4. Escrow and Pool Tables (`escrow_pool_schema.sql`)
- Manages escrow accounts and transactions
- Handles investment pools and pool members
- Includes comprehensive RLS policies

## Setup Instructions

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each schema file in the following order:
   - `users_schema.sql`
   - `opportunities_schema.sql`
   - `investments_schema.sql`
   - `escrow_pool_schema.sql`

### Option 2: Command Line
```bash
# Using psql (if you have direct database access)
psql -h your-db-host -U your-username -d your-database -f users_schema.sql
psql -h your-db-host -U your-username -d your-database -f opportunities_schema.sql
psql -h your-db-host -U your-username -d your-database -f investments_schema.sql
psql -h your-db-host -U your-username -d your-database -f escrow_pool_schema.sql
```

## Sample Data

Each schema file includes sample data for testing:
- **Users**: 6 sample users with different roles
- **Opportunities**: 3 sample investment opportunities
- **Investments**: 3 sample investments

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Entrepreneurs can view investments in their opportunities
- Published opportunities are visible to all users
- Admin users have broader access (configure as needed)

## Authentication Flow

The application uses Supabase Auth with the following flow:
1. User signs up with email/password
2. User profile is created in the `users` table
3. Email confirmation is sent (configure in Supabase Auth settings)
4. User confirms email and can sign in
5. User is redirected to role-specific dashboard

## Admin Access

Admin users are identified by specific email addresses:
- `abathwabiz@gmail.com`
- `admin@abathwa.com`

These users must provide the admin key (`vvv.ndev`) during signup.

## Testing

After setup, you can test the application with the demo accounts:
- **Admin**: admin@portal.com / admin123
- **Entrepreneur**: entrepreneur@portal.com / entrepreneur123
- **Investor**: investor@portal.com / investor123
- **Service Provider**: service@portal.com / service123

## Troubleshooting

### Common Issues

1. **Tables not found**: Ensure all schema files have been executed
2. **RLS errors**: Check that RLS policies are properly configured
3. **Authentication issues**: Verify Supabase Auth settings
4. **Sample data missing**: Re-run the schema files to insert sample data

### Verification

To verify the setup is working:
1. Check that all tables exist in your database
2. Verify sample data is present
3. Test user registration and login
4. Confirm role-based routing works correctly

## Security Notes

- Admin keys should be moved to environment variables in production
- RLS policies should be reviewed and customized for your needs
- Email confirmation should be enabled in Supabase Auth settings
- Consider implementing additional security measures for production use 