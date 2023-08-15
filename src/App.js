import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Configuration, OpenAIApi } from 'openai'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'

import './App.css'

import bossImage from './images/movieboss.png'
import arrowImage from './images/send-btn-icon.png'
import logoMovie from './images/logo-movie.png'
import loadingImg from './images/loading.svg'
import owlLogo from './images/owl-logo.png'
import droneLogo from './images/drone-logo.png'
import arrowImage2 from './images/send-btn-icon-2.png'

const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API,
})

const openai = new OpenAIApi(configuration)

const appSettings = {
    databaseURL:
        'https://openai-code-course-default-rtdb.europe-west1.firebasedatabase.app/',
}

const app = initializeApp(appSettings)

const database = getDatabase(app)

const conversationInDb = ref(database)

const instructionObjectExercise2 = {
    role: 'system',
    content:
        'You are a really sweaty english teacher that will give conversation to improve the user english level checking the user phrases and answering with the correct way to write the sentence if the user answer has any writing error.',
}

function App() {
    // Ejercicio 1: Generador de películas con imagen de cabecera incluida con Dall-e
    // Ejercicio 2: Chatbot para hablar inglés con ChatGPT 4
    // Ejercicio 3:
    const [ejercicio, setEjercicio] = useState(3)
    const [conversationStrExer3, setConversationStrExer3] = useState()

    /*** ChatGPT 3 & Dall-e start ***/
    const askChatGpt = async (prompt, max_tokens, temperature) => {
        const response = await openai.createCompletion({
            prompt: prompt,
            model: 'text-davinci-003',
            max_tokens: max_tokens,
            temperature: temperature ? temperature : undefined,
        })

        return response
    }

    const handleSend = async () => {
        const setupTextarea = document.getElementById('setup-textarea')
        const setupInputContainer = document.getElementById(
            'setup-input-container'
        )
        const movieBossText = document.getElementById('movie-boss-text')
        if (setupTextarea.value) {
            setupInputContainer.innerHTML = `<img src=${loadingImg} className="loading" id="loading">`
            movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`

            await fetchData(setupTextarea.value)
            await fetchSynopsis(setupTextarea.value)
        }
    }

    const fetchData = async (input) => {
        const movieBossText = document.getElementById('movie-boss-text')
        const prompt = `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
        ###
        outline: Two dogs fall in love and move to Hawaii to learn to surf.
        message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
        ###
        outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
        message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
        ###
        outline: A group of corrupt lawyers try to send an innocent woman to jail.
        message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
        ###
        outline: ${input}
        message: 
        `
        const max_tokens = 60

        const response = await askChatGpt(prompt, max_tokens)

        movieBossText.innerText = response.data.choices[0].text.trim()
    }

    const fetchSynopsis = async (input) => {
        const outputText = document.getElementById('output-text')

        const prompt = `Generate an engaging, professional and marketable movie synopsis based on an outline. The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role.
        
        ###
        outline: Street races with cars
        synopsis: Los Angeles street racer Dominic Toretto falls under the suspicion of the LAPD as a string of high-speed electronics truck robberies rocks the area. Brian O'Connor, an officer of the LAPD, joins the ranks of Toretto's highly skilled racing crew undercover to convict Toretto. However, O'Connor finds himself both enamored with this new world and in love with Toretto's sister, Mia. As a rival racing crew gains strength, O'Connor must decide where his loyalty really lies.
        ###
        
        outline: ${input}
        synopsis: 
        `
        const max_tokens = 700

        const response = await askChatGpt(prompt, max_tokens)

        const synopsis = response.data.choices[0].text.trim()

        outputText.innerText = synopsis

        fetchTitle(synopsis)
        fetchStars(synopsis)
    }

    const fetchTitle = async (synopsis) => {
        const outputText = document.getElementById('output-title')

        const prompt = `Generate a catchy movie title for this synopsis: ${synopsis}`
        const max_tokens = 25
        const temperature = 0.7

        const response = await askChatGpt(prompt, max_tokens, temperature)

        const title = response.data.choices[0].text.trim()

        outputText.innerText = title

        generateImage(title, synopsis)
    }

    const fetchStars = async (input) => {
        const outputText = document.getElementById('output-stars')

        const prompt = `Extract the names in brackets from the synopsis. 
        
        ###
        synopsis: David Dunn, an eccentric billionaire genius, has a plan to unleash an automated Artificial Intelligence system that will take over the world. With his brilliant mind David has created a powerful A.I. system made up of thousands of interconnected robots that can do anything he commands. But when David's plan is challenged by a group of hackers determined to foil his scheme, a thrilling race against time begins. With the help of his scientist confidant Delilah (Scarlett Johansson), David must find a way to protect his A.I. network and his plans for global domination. (Jeremy Renner as David Dunn, Scarlett Johansson as Delilah).
        names: Jeremy Renner, Scarlett Johansson
        ###
        
        synopsis: ${input}
        names:
        
        `
        const max_tokens = 30
        const temperature = 0.7

        const response = await askChatGpt(prompt, max_tokens, temperature)

        outputText.innerText = response.data.choices[0].text.trim()
    }

    const generateImage = async (title, synopsis) => {
        const outputImg = document.getElementById('output-img-container')

        const prompt = `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
        ###
        title: Love's Time Warp
        synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
        image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
        ###
        title: zero Earth
        synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
        image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
        ###
        title: ${title}
        synopsis: ${synopsis}
        image description: 
        `
        const max_tokens = 100
        const temperature = 0.8

        const promptToCreateImage = await askChatGpt(
            prompt,
            max_tokens,
            temperature
        )

        const response = await openai.createImage({
            prompt: `${promptToCreateImage.data.choices[0].text.trim()}. There should be no text in this image.`,
            n: 1,
            size: '512x512',
            response_format: 'url',
        })

        outputImg.innerHTML = `<img src="${response.data.data[0].url}">`

        const setupInputContainer = document.getElementById(
            'setup-input-container'
        )
        const movieBossText = document.getElementById('movie-boss-text')
        setupInputContainer.innerHTML = `<button id="view-pitch-btn" className="view-pitch-btn">View Pitch</button>`
        document
            .getElementById('view-pitch-btn')
            .addEventListener('click', () => {
                document.getElementById('setup-container').style.display =
                    'none'
                document.getElementById('output-container').style.display =
                    'flex'
                movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
            })
    }
    /*** ChatGPT 3 & Dall-e end ***/

    /*** ChatGPT 4 start ***/

    useEffect(() => {
        if (ejercicio === 2) {
            get(conversationInDb).then(async (snapshot) => {
                if (snapshot.exists()) {
                    const conversationArr = Object.values(snapshot.val())
                    console.log('conversationArr', conversationArr)
                    const chatbotConversation = document.getElementById(
                        'chatbot-conversation'
                    )
                    conversationArr.map((speech) => {
                        if (speech.content) {
                            const newSpeechBubble =
                                document.createElement('div')
                            newSpeechBubble.classList.add(
                                'speech',
                                `speech-${
                                    speech.role === 'user' ? 'human' : 'ai'
                                }`
                            )
                            chatbotConversation.appendChild(newSpeechBubble)
                            newSpeechBubble.textContent += speech.content
                            chatbotConversation.scrollTop =
                                chatbotConversation.scrollHeight
                        }
                    })
                } else {
                    console.log('No data available.')
                }
            })
        }
    }, [])

    const removeConversationFromDB = () => {
        const chatbotConversation = document.getElementById(
            'chatbot-conversation'
        )
        remove(conversationInDb)
        chatbotConversation.innerHTML = ''
        renderTypewriterText('How can I help you?')
    }

    const handleSubmit = () => {
        const chatbotConversation = document.getElementById(
            'chatbot-conversation'
        )
        const userInput = document.getElementById('user-input')

        if (ejercicio === 2) {
            push(conversationInDb, {
                role: 'user',
                content: userInput.value,
            })
        }

        ejercicio === 2 && fetchReply()
        ejercicio === 3 && fetchReply(userInput.value)
        const newSpeechBubble = document.createElement('div')
        newSpeechBubble.classList.add('speech', 'speech-human')
        chatbotConversation.appendChild(newSpeechBubble)
        newSpeechBubble.textContent = userInput.value
        userInput.value = ''
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }

    useEffect(() => {
        console.log('conversationStrExer3', conversationStrExer3)
    }, [conversationStrExer3])

    const fetchReply = async (userValue) => {
        if (ejercicio === 2) {
            get(conversationInDb).then(async (snapshot) => {
                if (snapshot.exists()) {
                    const conversationArr = Object.values(snapshot.val())
                    const completionRequest = {
                        model: 'gpt-3.5-turbo',
                        messages: [instructionObjectExercise2].concat(
                            conversationArr
                        ),
                        presence_penalty: 2,
                    }

                    const response = await openai.createChatCompletion(
                        completionRequest
                    )
                    push(conversationInDb, response.data.choices[0].message)
                    renderTypewriterText(
                        response.data.choices[0].message.content
                    )
                } else {
                    console.log('No data available.')
                }
            })
        } else if (ejercicio === 3) {
            const completionRequest = {
                model: 'davinci:ft-personal-2023-08-15-19-41-31',
                prompt: userValue + " ->",
                presence_penalty: 0,
                frequency_penalty: 0.3,
                max_tokens: 100,
                temperature: 0,
                stop: ['\n', '->']
            }
            const response = await openai.createCompletion(completionRequest)
            console.log('response', response)
            setConversationStrExer3(conversationStrExer3 + " " + response.data.choices[0].text + " -> \n")
            renderTypewriterText(response.data.choices[0].text)
        }
    }

    const renderTypewriterText = (text) => {
        const chatbotConversation = document.getElementById(
            'chatbot-conversation'
        )
        const newSpeechBubble = document.createElement('div')
        newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
        chatbotConversation.appendChild(newSpeechBubble)
        let i = 0
        const interval = setInterval(() => {
            newSpeechBubble.textContent += text.slice(i - 1, i)
            if (text.length === i) {
                clearInterval(interval)
                newSpeechBubble.classList.remove('blinking-cursor')
            }
            i++
            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
        }, 50)
    }

    /*** ChatGPT 4 end ***/

    /*** ChatGPT 4 Fine Stuning start ***/

    /*** ChatGPT 4 Fine Stuning end ***/

    return (
        <>
            {ejercicio === 1 && (
                <div className="App">
                    <header>
                        <img src={logoMovie} alt="MoviePitch" />
                        <a href="/">
                            <span>Movie</span>Pitch
                        </a>
                    </header>
                    <main>
                        <section id="setup-container">
                            <div className="setup-inner">
                                <img src={bossImage} alt="alt" />
                                <div
                                    className="speech-bubble-ai"
                                    id="speech-bubble-ai"
                                >
                                    <p id="movie-boss-text">
                                        Give me a one-sentence concept and I'll
                                        give you an eye-catching title, a
                                        synopsis the studios will love, a movie
                                        poster... AND choose the cast!
                                    </p>
                                </div>
                            </div>
                            <div
                                className="setup-inner setup-input-container"
                                id="setup-input-container"
                            >
                                <textarea
                                    id="setup-textarea"
                                    placeholder="An evil genius wants to take over the world using AI."
                                ></textarea>
                                <button
                                    className="send-btn"
                                    id="send-btn"
                                    aria-label="send"
                                    onClick={handleSend}
                                >
                                    <img src={arrowImage} alt="send" />
                                </button>
                            </div>
                        </section>
                        <section
                            className="output-container"
                            id="output-container"
                        >
                            <div
                                id="output-img-container"
                                className="output-img-container"
                            ></div>
                            <h1 id="output-title"></h1>
                            <h2 id="output-stars"></h2>
                            <p id="output-text"></p>
                        </section>
                    </main>
                    <footer>&copy; 2023 MoviePitch All rights reserved</footer>
                </div>
            )}
            {ejercicio === 2 && (
                <section className="chatbot-container">
                    <div className="chatbot-header">
                        <img src={owlLogo} className="logo" />
                        <h1>KnowItAll</h1>
                        <h2>Ask me anything!</h2>
                        <p className="supportId">User ID: 2344</p>
                        <button
                            className="clear-btn"
                            id="clear-btn"
                            onClick={removeConversationFromDB}
                        >
                            start over
                        </button>
                    </div>
                    <div
                        className="chatbot-conversation-container"
                        id="chatbot-conversation"
                    >
                        <div className="speech speech-ai">
                            How can I help you?
                        </div>
                    </div>
                    <form id="form" className="chatbot-input-container">
                        <input
                            name="user-input"
                            type="text"
                            id="user-input"
                            required
                        />
                        <button
                            id="submit-btn"
                            className="submit-btn"
                            onClick={handleSubmit}
                        >
                            <img src={arrowImage2} className="send-btn-icon" />
                        </button>
                    </form>
                </section>
            )}
            {ejercicio === 3 && (
                <section className="chatbot-container">
                    <div className="chatbot-header">
                        <img src={droneLogo} className="logo" />
                        <h1>We-Wingit Drone</h1>
                        <h2>Delivery Support Chat</h2>
                        <p className="supportId">ID: 2344</p>
                        <button
                            className="clear-btn"
                            id="clear-btn"
                            onClick={removeConversationFromDB}
                        >
                            start over
                        </button>
                    </div>
                    <div
                        className="chatbot-conversation-container"
                        id="chatbot-conversation"
                    >
                        <div className="speech speech-ai">
                            How can I help you with your We-Wingit drone
                            delivery?
                        </div>
                    </div>
                    <form id="form" className="chatbot-input-container">
                        <input
                            name="user-input"
                            type="text"
                            id="user-input"
                            required
                        />
                        <button
                            id="submit-btn"
                            className="submit-btn"
                            onClick={handleSubmit}
                        >
                            <img src={arrowImage2} className="send-btn-icon" />
                        </button>
                    </form>
                </section>
            )}
        </>
    )
}

export default App
