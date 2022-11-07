# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of URLs page"](https://github.com/sidnat/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["screenshot of Short URL ID"](https://github.com/sidnat/tinyapp/blob/master/docs/short-url-id.png?raw=true)
!["screenshot of Login page"](https://github.com/sidnat/tinyapp/blob/master/docs/login.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.
- go to localhost:8080/register to Register an account.
!["Screenshot of Registration page"](https://github.com/sidnat/tinyapp/blob/master/docs/register.png?raw=true)
- Login with registered account.
!["screenshot of Login page"](https://github.com/sidnat/tinyapp/blob/master/docs/login.png?raw=true)
- Create new URL (http://...) will give you a Short URL ID corresponding to your long URL ID which can be edited.
!["Screenshot of Create TinyURL page"](https://github.com/sidnat/tinyapp/blob/master/docs/create-short-url-id.png?raw=true)
!["screenshot of Short URL ID"](https://github.com/sidnat/tinyapp/blob/master/docs/short-url-id.png?raw=true)
- After you've created a new Short URL ID, you can visit the stored long URL by visiting "localhost:8080/u/" followed by the Short URL ID.
- click the "My URLS" link to view all saved Short URL ID's. Edit or Delete a Short URL ID by clicking the "Edit" or "Delete" button.
!["Screenshot of URLs page"](https://github.com/sidnat/tinyapp/blob/master/docs/urls-page.png?raw=true)