var wordpress = require( "wordpress" );
var Twitter = require('twitter-lite');
require('dotenv').config()

//wordpress connection
var wpClient = wordpress.createClient({
    url: process.env.URL,
    username: process.env.USER,
    password: process.env.PASSWORD
});

//twitter connection

const twitterClient = new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token,
    access_token_secret: process.env.access_token_secret
});
  
// helper functions
function wpIDMatch(name) {
    if (name === "198574942") {
        return "TestBot"
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function parseContent(data) {
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

wpClient.getPosts(function( error, posts ) {
    if (error) throw error
    else {
        // grab a random post, destructure array, console.log data
        let {title, author, content, link} = posts[getRandomInt(posts.length)]
        console.log("\ntitle: "+ title + "\nauthor: " + wpIDMatch(author) + "\ncontent: " + parseContent(content) + "\nlink: " + link)

        const thread = [parseContent(content), `${title} by ${wpIDMatch(author)}`,`find at ${link}` ];
        tweetThread(thread).catch(console.error);
    }
});

async function tweetThread(thread) {
    let lastTweetID = "";
    for (const status of thread) {
      const tweet = await twitterClient.post("statuses/update", {
        status: status,
        in_reply_to_status_id: lastTweetID,
        auto_populate_reply_metadata: true
      });
      lastTweetID = tweet.id_str;
    }
}
  
 