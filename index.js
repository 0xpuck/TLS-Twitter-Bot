var wordpress = require( "wordpress" );
require('dotenv').config()

// console.log(process.env)

//Switch over to dotenv!
var client = wordpress.createClient({
    url: process.env.URL,
    username: process.env.USER,
    password: process.env.PASSWORD
});

let wpIDMatch = function(name) {
    if (name === "198574942") {
        return "Alex Taylor"
    }
}
 
//html cleanup helper function / package such as https://www.npmjs.com/package/sanitize-html

client.getPosts(function( error, posts ) {
    if (error) throw error
    else {
        for (let i = 0; i < posts.length; i++) {
            console.log(
                `Post ${i}: 
                --------------------
                Title: ${posts[i].title}
                Link: ${posts[i].link}
                Author: ${wpIDMatch(posts[i].author)}
                Content: ${posts[i].content}
                ---------------------
                `
            )
            // console.log(posts[i])
        }
    }
});