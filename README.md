Tech Stack and Justification:

Frontend:
    - React.js: Chosen for component-based architecture to manage complex states like the Discussion Forum and Registration forms. (mandated by assignment requirements)
    - React Router Dom: Handles navigation and role-based access control (e.g., ProtectedRoute for Admins/Organizers).
    - Lucide React: Provides a consistent, lightweight icon set for a professional UI.
    - React Hot Toast: Used for non-blocking, real-time feedback during form submissions.
    - Axios: Configured with an interceptor for seamless JWT authentication with the backend.

Backend (All of the following were specified and mandated by the assignment requirements):
    - Node.js & Express: Scalable environment for handling RESTful APIs and middleware-based authentication.
    - MongoDB & Mongoose: Schema-based NoSQL database chosen for its flexibility in handling diverse data like customFormFields and itemDetails.
    - JWT (JSON Web Tokens): Secure, stateless authentication for cross-origin requests.
    - Bcrypt: Industry-standard hashing for securing passwords and reset requests.



Advanced Features (Tiers A and B):

Tier A- Merchandise Payment Approval:
    - Approach: Implemented a manual verification loop. Users upload a Base64 image of their payment proof.
    - Design Choice: The order remains Pending and blocks QR generation/emailing until an Organizer manually verifies the image. This ensures financial accuracy before stock decrement.

Tier A- QR Scanner and Live Attendance:
    - Approach: Built a dedicated scanning interface for Organizers using a custom QRScanner component.
    - Design Choice: Attendance is tracked in real-time with timestamps, preventing double check-ins and providing instant analytics on the event dashboard.

Tier B- Admin-Mediated Password Reset:
    - Approach: Instead of automated links, Organizers submit a reset request with a reason.
    - Technical Decision: Admin views a security dashboard to approve/reject. Upon approval, the pre-hashed newPasswordHash is automatically promoted to the user's primary password.

Tier B- Real-Time Discussion Forum:
    - Approach: Created a threaded comment system on event pages using a parentComment reference model.
    - Design Choice: Used a 10-second polling interval for a "real-time" feel without the complexity of WebSockets. Includes role-based logic allowing only Organizers to post "Official Replies".



Setup and Installation:

1. Clone the repository

2. Backend Setup:
    i) Navigate to /backend.
    ii) Install dependencies: npm install.
    iii) Create a .env file with: PORT=5000, MONGO_URI, JWT_SECRET.
    iv) Start server: npm start or npx nodemon server.js.

3. Frontend Setup:
    i) Navigate to /frontend.
    ii) Install dependencies: npm install.
    iii) Start application: npm start.



Data Model Additions:

1. User Model Additions (User.js):

    - passwordResetRequests [Array of Objects]:
        - Justification: This attribute is essential for the Tier B: Admin-mediated Password Reset feature. It allows the system to store a history of requests, including the reason for the reset and the hashed new password, without over-writing the current active password until an Admin approves it.

    - status (within passwordResetRequests):
        - Justification: Required to track the lifecycle of a security request (Pending, Approved, Rejected) as mandated by Tier B requirements.

    - adminComments and resolvedAt:
        - Justification: Ensures accountability and provides feedback to the Organizer. The resolvedAt timestamp fulfills the requirement for tracking reset history.

2. Event Model Additions (Event.js):

    - status [Enum: Draft, Published, etc.]:
        - Justification: Vital for the Organizer Workflow. It ensures that events aren't visible to participants until the Organizer is ready (Draft vs. Published) and locks editing once an event is Ongoing or Completed to maintain data integrity.

    - revenue:
        - Justification: Required for the Section 10.3 Organizer Analytics. It provides a direct field to track the financial success of an event, which is displayed on the Organizer Dashboard.

3. Registration Model Additions (Registration.js):

    - paymentProof [String]:
        -  Justification: Specifically added for the Tier A: Merchandise Payment Approval Workflow. It stores the reference (Base64 or URL) to the payment screenshot uploaded by the participant for manual verification by the organizer.

    - attended and attendanceTimestamp:
        - Justification: Implements the Tier A: QR Scanner & Live Attendance feature. These fields allow for real-time tracking of presence and provide the data needed for the live attendance dashboard.


