

# HackerNews Keyboard Slideshow

This is a simple web (app?) to show you top stories in hacker news, and navigate using only the keyboard arrows. 

## Navigation
Right and Left arrow key to navigate the top stories.
Down arrow is used to load comments for the visible story. Once loaded, normal navigation downward continues.

## Technologies Used
This web app uses latest web APIs including async functions, Promise.all, fetch API and other DOM specific stuff that wouldn't work in IE8. This is not tested on any other browsers than Chrome and Firefox. I don't care for you, I'm sorry. 

The Hackernews API used is found here: [https://github.com/HackerNews/API](HackerNews API). The API uses a simple ID for both stories, and comments.

### TODO:
- [x] Comment section hint (press down helper below title)
- [x] Comment number below title. (wont do)
- [ ] Add index to URL, so when you refresh, you can pass the Url to someone else. Load from URL if index is present.