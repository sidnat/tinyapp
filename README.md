# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- go to localhost:8080/register to Register an account.
- Login with registered account.
- Create new URL (http://...) will give you a Short URL ID.
- After you've created a new Short URL ID, you can visit the stored long URl by visiting "localhost:8080/u/" followed by the Short URL ID.
- click the "My URLS" link to view all saved Short URL ID's.
- Edit or Delete a Short URL ID by clicking the "Edit" or "Delete" button.