var wordpress = require( "wordpress" );
require('dotenv').config()

var client = wordpress.createClient({
    url: process.env.URL,
    username: process.env.USER,
    password: process.env.PASSWORD
});

function wpIDMatch(name) {
    if (name === "198574942") {
        return "Alex Taylor"
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function parseContent(data) {
    // get length of text
    // pick a random number from 0 to length-1
    let text = data.replace(regex, "").trim()
    let randNum = getRandomInt(text.length-1)
    let randDiff = text.length-1-randNum

    if (randDiff > 120 - 6){
        randDiff = 120 - 6
    }

    parsedString = text.substring(randNum,randDiff+randNum)
    parsedString = "..." + parsedString + "..."

    return parsedString
}

let regex = /(<\/?(p|br)>)+|(<!-- \/?wp:paragraph -->)+/gmi

client.getPosts(function( error, posts ) {
    if (error) throw error
    else {
        // grab a random post, destructure array, console.log data
        
        let {title, author, content, link} = posts[getRandomInt(posts.length)]

        // console.log("\ntitle: "+ title + "\nauthor: " + wpIDMatch(author) + "\ncontent: " + content.replace(regex, "") + "\nlink: " + link)

        console.log(parseContent(content))        
    }
});