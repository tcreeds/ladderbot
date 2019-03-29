
var qs = require('querystring')
const axios = require('axios')

class Handler {

    constructor(api_base){
        this.api_base = api_base
    }

    async handle(event, context, callback) {
        const body = qs.parse(decodeURIComponent(event.body))
        console.log("event")
        console.log(event)
        if (event.path === "/challenge"){
            console.log("/challenge")
            const userName = body.user_name
            const res = await axios.get(`${this.api_base}/api/players`)
            const players=res.data
            console.log(res.data)
            const user = players.find(it => it.slackName === userName)
            if (user === undefined){
                this.respond(200, callback, {
                    response_type: "ephemeral",
                    text: "You don't have a slack name registered. Use /challenger-register {ping-pong-name}"
                })
            }
            else {
                const challengees = players.filter(it => it.rank < user.rank && it.rank > (user.rank + 3))
                if (challengees.length === 0){
                    this.respond(200, callback, { response_type: "ephemeral", text: 'There is no one for you to challenge'})
                }
                else {
                    const attachments = challengees.map(it => {
                        if (it.slackName)
                            return { 
                                fallback: "Somethin goofed",
                                callback_id: "issue-challenge",
                                actions: [
                                    {
                                        name: "response",
                                        text: user.name,
                                        type: "button",
                                        value: `${user.slackName}:${it.slackName}`
                                    }
                                ]
                            }
                        else
                            return { text: it.slackName }
                    })
                    this.respond(200, callback, {
                        response_type: "ephemeral",
                        text: 'You can challenge: ',
                        attachments
                    })
                }
            }
            
        }
        else if (event.path === "/challenger-register"){
            console.log("/challenger-register")
        }
        else if (event.path === "/challenge-user"){
            if (body.callback_id === "issue-challenge"){
                const split = body.actions[0].value.split(":")
                const res = await axios.get(`${this.api_base}/api/players`)
                const players = res.data
                const challenger = players.find(it => it.slackName === split[0])
                const other = players.find(it => it.slackName === split[1])
                this.respond(200, callback, {
                    text: `<!${challenger.slackName}> has challenged <!${other.slackName}>!`,
                    attachments: { 
                        fallback: "Somethin goofed",
                        callback_id: "result",
                        actions: [
                            {
                                name: "response",
                                text: `${challenger.name} won the match`,
                                type: "button",
                                value: `${challenger.slackName}:${it.slackName}`
                            },
                            {
                                name: "response",
                                text: `${other.name} won the match`,
                                type: "button",
                                value: `${other.slackName}:${challenger.slackName}`
                            }
                        ]
                    }
                })
            }
        }
    }

    respond(status = 200, callback, data){
        const response = {
            statusCode: status,
            headers: {
            'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
        };
        callback(null, response)
    }


}

module.exports = Handler