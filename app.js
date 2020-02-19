const loadingElement = document.getElementById('loading')
const storyTitleElement = document.getElementById('story-title')
const URL = document.getElementById('story-url')
const TEXT = document.getElementById('story-text')


const getStory = async (storyID) => {  
  const story = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyID}.json?print=pretty`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {      
      return data;
    });

  return story;
}


const renderCurrentStory = async (storyArray) => {
  const currentStoryIndex = localStorage.getItem('currentStoryIndex');
  const currentStoryID = storyArray[currentStoryIndex]
  const story = await getStory(currentStoryID)  

  let hasText = story.text === undefined ? false : true;
  let content = hasText ? story.text : story.url
  
  storyTitleElement.innerHTML = story.title;

  if (hasText) {
    URL.classList.add('hide')
    URL.innerHTML = '';
    URL.href = "";

    TEXT.innerHTML = content;
    TEXT.classList.remove('hide')    
  } else {
    TEXT.classList.add('hide')
    TEXT.innerHTML = '';

    URL.innerHTML = content;
    URL.href = content;
    URL.classList.remove('hide')
    URL.focus();
  }
}


const attachEventListeners = (storiesArray) => {
  const stories = storiesArray;

  document.onkeydown = (e) => {
    let totalStoryIndex = localStorage.getItem('topStoriesLength');
    let currentStoryIndex = localStorage.getItem('currentStoryIndex');
    
    // LEFT
    if (e.keyCode == '37') {
      if (currentStoryIndex < 1) {        
        return;
      }

      let newIndex = Number(currentStoryIndex) - 1
      const newStoryIndex = localStorage.setItem('currentStoryIndex', newIndex);
      
      renderCurrentStory(stories);
    }
    
    
    // RIGHT
    else if (e.keyCode == '39') {
      if (currentStoryIndex >= totalStoryIndex - 1) {        
        return;
      }

      let newIndex = Number(currentStoryIndex) + 1
      const newStoryIndex = localStorage.setItem('currentStoryIndex', newIndex);
      

      renderCurrentStory(stories);
    }
  };
}



const getTopStories = async (storyID) => {  
  const stories = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {   
    const currentStoryIndex = localStorage.getItem('currentStoryIndex');

    // If no index set, set to zero.
    if (!currentStoryIndex) {
      localStorage.setItem('currentStoryIndex', 0) 
    }
    
    // Save data
    localStorage.setItem('topStoriesLength', data.length);
    localStorage.setItem('topStories', data);
    
    return data;
  });
  
  return stories;
}



(async function() { 
  const storiesArray = await getTopStories()
  await renderCurrentStory(storiesArray)

  const action = attachEventListeners(storiesArray)  
})();