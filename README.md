# SmartTime - Intelligent Timetable Management System

SmartTime is a comprehensive timetable management system designed for educational institutions. It provides role-based access for administrators, department heads, principals, and teachers to efficiently manage class schedules and workloads.

## Features

- **Role-Based Access Control**: Different dashboards and permissions for Admins, HoDs, Principals, and Teachers.
- **Smart Scheduling**: Automatically prevents scheduling conflicts for teachers and classrooms.
- **SMS Notifications**: Automatic alerts for teachers before their scheduled classes.
- **Workload Management**: Track and manage teacher workloads across departments.
- **Comprehensive Reporting**: View detailed reports on classroom utilization, teacher workloads, and more.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: Clerk
- **SMS Notifications**: Twilio

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB database
- Clerk account for authentication
- Twilio account for SMS notifications

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smarttime.git
   cd smarttime
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # MongoDB Connection
   MONGODB_URI=your_mongodb_uri_here

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # Clerk Routes
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Twilio SMS API
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smarttime/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard pages
│   └── ...
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   └── ...
├── lib/                  # Utility functions
│   ├── db.js             # MongoDB connection
│   └── twilio.js         # Twilio SMS functions
├── models/               # MongoDB models
│   ├── User.js
│   ├── Classroom.js
│   ├── Subject.js
│   ├── Semester.js
│   └── Timetable.js
├── public/               # Static files
└── ...
```

## API Endpoints

### Users

- `GET /api/users` - Get all users (with optional filtering)
- `POST /api/users` - Create a new user
- `PUT /api/users` - Update multiple users (batch update)
- `GET /api/users/[id]` - Get a specific user
- `PATCH /api/users/[id]` - Update a specific user
- `DELETE /api/users/[id]` - Delete a specific user

### Timetables

- `GET /api/timetables` - Get all timetables (with optional filtering)
- `POST /api/timetables` - Create a new timetable entry
- `PUT /api/timetables` - Update multiple timetable entries (batch update)
- `POST /api/timetables/send-alerts` - Send SMS alerts to teachers

## Role-Based Features

### Admin

- Manage users (Teachers, HoDs, Principal)
- Create and manage Classrooms, Semesters, and Subjects
- Assign workload to teachers
- View and manage all timetables

### HoD (Head of Department)

- View assigned timetable
- Assign additional workload to teachers in their department
- Manage department-specific subjects

### Principal

- View full workload of all teachers and HoDs
- View overall timetable of the institution
- Monitor department performance

### Teacher

- View individual workload and timetable
- Receive SMS alerts before classes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.dev/)
- [Twilio](https://www.twilio.com/)
