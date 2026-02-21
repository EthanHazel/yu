# WORK IN PROGRESS

> This project is still under development. For the most stable experience, use the main branch.

<p align="center"><img src=".github/images/favicon.ico" style="width:128px;height:128px;"  /></p>
<h1 align="center">Yu</h1>
<p align="center">Stands for "You Up?"</p>
<h3 align="center">An alarm clock that doesn't piss you off. Schedule YouTube videos for your Roku TV in the morning to wake you up.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)" />
  <img src="/.github/images/sep.png" />
  <img src="https://img.shields.io/github/languages/code-size/EthanHazel/yu" />
  <img src="https://img.shields.io/github/stars/EthanHazel%2Fyu" />
</p>

## How it works

Yu is a home server application. It runs a front end website on your local network that lets you adjust alarms, and have a back end that also runs to set those alarms off.

Roku TVs have the ability to recieve web requests to act as a remote, or as instructions to open a specific app. Yu uses this to turn your TV on during the specified time, and play the YouTube video you'd like.

## Features

### Content Options

- Play a fixed video
- Play the most recent video from a channel or playlist
- Play a random video from a channel or playlist
- Create a "random pool", which will pick a random open of the three options listed above

### Content Filters

- Filter by length (disables YouTube shorts)
- Filter max results when picking random video

### Requirements

If you'd like to use anything other than a fixed video, you'll need a YouTube v3 API Key

### Setup

#### Docker

> TODO: Setup tutorial

#### Manual

> TODO: Setup tutorial
