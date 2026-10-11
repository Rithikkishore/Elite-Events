# Elite Events

## Run with MongoDB

1. Install Node.js and start MongoDB locally, or create a MongoDB Atlas cluster.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string. Set `JWT_SECRET` to a private random value of at least 32 characters.
3. Run `npm install`, then `npm start`.
4. Open `http://localhost:3000`.

Open the site through this server, not by opening the HTML files directly. User accounts (with bcrypt-hashed passwords) and booking records are stored in MongoDB. The login token remains in the browser's local storage.