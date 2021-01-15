const wordpress = require( "wordpress" );
const Twitter = require('twitter-lite');
const nlp = require('compromise');
nlp.extend(require('compromise-sentences'))

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

//wordpress connection
const wpClient = wordpress.createClient({
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
    if (name === "186682056") {
        return "Tracy"
    } else if (name === "183710799") {
        return "Kyle"
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function parseContent(data) {
    let regex = /(<\/?(p|br)>)+|(<!-- \/?wp:paragraph -->)+/gmi
    let text = data.replace(regex, "").trim()
    return text
}

let nlpSentences = function(text) {
    let doc = nlp(text)
    let sentences = doc.sentences();
    return sentences
}

let limitLength = function(text){
    if (text.length <= 280) {
        return text
    } else {
        return text.slice(0,277) + "..." 
    }
}

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

let dayInMS = 86400000

const intervalObj = setInterval(() => {
    wpClient.getPosts(function( error, posts ) {
        if (error) throw error
        else {
            // grab a random post, destructure array, pull out html tags, pick a random sentence
            let postIndex = getRandomInt(0,posts.length);
            let {title, author, content, link} = posts[postIndex]
            let sentences = nlpSentences(parseContent(content));    
    
            // get number of sentences, pick random sentence to use
            let sentenceNum = sentences.json().length
            let randIndex = getRandomInt(0,sentenceNum)
            let randomLine = limitLength(sentences.json()[randIndex].text)
            let regex = /(<\w+>)|(<\/\w+>)|(\&nbsp\;)|(\&nbsp)/gi
            let cleanString = randomLine.replace(regex, "");
            // console.log(randomLine.match(regex))
    
            // make tweet
            const thread = [cleanString, `${title} by ${wpIDMatch(author)} @ ${link}`];
            tweetThread(thread).catch(console.error);
            // console.log(thread)
        }
    }); 
  }, dayInMS);