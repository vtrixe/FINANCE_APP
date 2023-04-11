# SmartWealthMate
A MERN stack-based finance manager application that helps businesses and individuals to track and view expenses, revenues, products, transactions, investments, and their future predictions using machine learning regression models. This application is built using Material UI, Node, Next.js, Redux, Recharts, MongoDB, and Express. The app fetches data from the database and creates analytics and predictions based on the algorithms designed. In the future, we plan to add more functionality such as connecting with other applications,using more prediction models and adding ability to handle meta-level of datasets.

Features
User authentication with JWT tokens.
A dashboard to view expenses, revenues, products, transactions, investments, and their trends.
Prediction models based on machine learning regression algorithms.
Interactive charts using Recharts.
A secure backend with Express and MongoDB.
The app is currently used as a Guest while user functionality is maintained using DB credentials.
Material UI-based frontend with a responsive design.
Installation
To run this project locally, you need to have Node.js, MongoDB, and Git installed on your system. Follow the instructions below to run this app on your machine.

bash
Copy code
git clone https://github.com/username/repo-name.git
cd repo-name
npm install
Create a .env file in the root directory of the project and add the following environment variables:

bash
Copy code
DATABASE_URI=<mongodb-uri>
JWT_SECRET=<jwt-secret-key>
Start the app in development mode using the following command:

bash
Copy code
npm run dev
Deployment
This app can be deployed to any cloud hosting platform that supports Node.js and MongoDB. Before deploying, make sure to set the environment variables for your production environment. You can use a .env.production file to store your environment variables.

bash
Copy code
npm run build
npm start

client Deployment Link(using sample data from serveer DB):https://hack-eclipse-finance-app-ko4l.vercel.app/

CREDIT:
This is Built from taking guidance from Ed Roh MERN finance app.
