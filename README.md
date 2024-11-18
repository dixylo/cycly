# Cycly

This is the back end of a cycle-renting website.

## Run locally

1. Install dependencies by `npm i`.
2. If MongoDB has been installed, run `mongod` to start it.
3. Set the environment variable `cycly_jwtPrivateKey` by `export cycly_jwtPrivateKey=some_string`. Replace 'some_string' with whatever you want. No need to set the environment variable for the database connection string since the default value is for connecting to a local database.
4. Start the app by `npm start`.

## Run remotely

Follow the instructions of the platform where the app is hosted to set the environment variables `cycly_jwtPrivateKey` and `cycly_db`. `cycly_db` is the connection string obtained from the MongoDB website.
