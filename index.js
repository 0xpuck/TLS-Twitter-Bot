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

let regex = /(<\/?(p|br)>)+|(<!-- \/?wp:paragraph -->)+/gmi

client.getPosts(function( error, posts ) {
    if (error) throw error
    else {
        for (let i = 0; i < posts.length; i++) {
            console.log(
                `Post ${i}: \nTitle: ${posts[i].title}\nLink: ${posts[i].link}\nAuthor: ${wpIDMatch(posts[i].author)}\nContent: \n${posts[i].content.replace(regex," ")}`
            )
        }
    }
});