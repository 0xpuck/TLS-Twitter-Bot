const wordpress = require( "wordpress" );
const Twitter = require('twitter-lite');
const nlp = require('compromise');
nlp.extend(require('compromise-sentences'))
require('dotenv').config()

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
    if (name === "198574942") {
        return "TestBot"
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function parseContent(data) {
    let regex = /(<\/?(p|br)>)+|(<!-- \/?wp:paragraph -->)+/gmi
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

wpClient.getPosts(function( error, posts ) {
    if (error) throw error
    else {
        // grab a random post, destructure array, console.log data
        let {title, author, content, link} = posts[getRandomInt(posts.length)]

        let documentNLP = nlpGeneral(parseContent(content))
        let docTags = documentNLP.out('text')

        let sentences = nlpSentences(parseContent(content));    
        let sentencesTags = sentences.out('tags');

        // get number of sentences
        // pick a random starting index

        let sentenceNum = sentencesTags.length
        let randIndex = getRandomInt(0,sentenceNum-1)
    
        let posNLP = Object.values(sentencesTags[index]);

        console.log(posNLP)

        // adding "#" to the beginning of each tag so they can be used in .match()
        for (let i = 0; i < posNLP.length; i++){
            if (posNLP[i].length === 1) {
                posNLP[i] = "#" + posNLP[i] 
            }
            else {
                for (let j = 0; j < posNLP[i].length; j++) {
                    posNLP[i][j] = "#" + posNLP[i][j] 
                }
            }
        }

        for (let i = 0; i < posNLP.length; i++) {
            // if the value at the index is a string, or single value
            if (typeof posNLP[i] == "string") {

                // find all words that match the term, pick one random one and concat
                let match = documentNLP.match(posNLP[i]).json()
                let randomSelection = match[getRandomInt(0,match.length-1)]

                if (randomSelection != undefined) {
                    saveString+= randomSelection.text + " "
                }
            }
            // if the value is an object, or has multiple values
            else {
                let subArrayStr = ""
                let subArrayLoopRandom = getRandomInt(0, posNLP[i].length-1)

                // pulling a random number of tags to vary specificity
                for (let j = 0; j < subArrayLoopRandom; j++){
                    subArrayStr += " " + posNLP[i][j]
                }
                //searching for all words that match tags, pulling a random word from that list
                let match = documentNLP.match(subArrayStr).json()
                let randomSelection = match[getRandomInt(0,match.length-1)]

                if (randomSelection != undefined) {
                    saveString+= randomSelection.text + " "
                }   
            }
        }
     
        const thread = [parseContent(content), `${title} by ${wpIDMatch(author)} ${link}`];
        // tweetThread(thread).catch(console.error);
    }
}); 