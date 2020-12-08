Hire me! This project marked the time where I was introduced to a more complex data flow and the dynamics of working with Node and SQL extensively.

https://arivaldo.herokuapp.com/

Backend
In the back a Node.js Express Server and a PostgreSQL database take care of things like storing user information and authentication. The platform is protected from potential SQL injections and CSURF attacks. When a user signs, rather than storing an image, the raw data string is stored. This helps reduce file size and later, when displaying the signature again, it makes sure there are no pixelated signatures. Express-Handlebars is used to render different HTML templates.

See who already signed
View other signers name, age, city and website.

Authentication
Authentication is accomplished using Node.js, Bcrypt and cookies.
If something went wrong, an error message will alert the user.

Sign the petition
Provide a signature by drawing into the HTML canvas element. The logic was written in JavaScript jQuery.
