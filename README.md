Hire me! This project marked the time where I was introduced to a more complex data flow and the dynamics of working with Node and SQL extensively.

BACKEND:
In the back a Node.js Express Server and a PostgreSQL database take care of things like storing user information and authentication. The platform is protected from potential SQL injections and CSURF attacks. When a user signs, rather than storing an image, the raw data string is stored. This helps reduce file size and later, when displaying the signature again, it makes sure there are no pixelated signatures. Express-Handlebars is used to render different HTML templates.

SEE WHO ALREADY SIGNED
View other signers name, age, city and website.

AUTHENTICATION
Authentication is accomplished using Node.js, Bcrypt and cookies.
If something went wrong, an error message will alert the user.

SIGN THE PETITION
Provide a signature by drawing into the HTML canvas element. The logic was written in JavaScript jQuery.
After successfully signing, the user is shown his signature as well as a list of everybody else who signed. The user can also sort by city and see how much the neighbors care about the issue.
The user can also edit the profile, delete or change the signature.

FRONTEND
Using Handlebars, information from the server is being displayed.
