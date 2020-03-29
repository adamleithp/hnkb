const loadingElement = document.getElementById('loading')
const TITLE = document.getElementById('story-title')
const HN_LINK = document.getElementById('story-in-hackernews')
const BODY = document.body;
const RESET = document.getElementById('story-reset')
const URL = document.getElementById('story-url')
const TEXT = document.getElementById('story-text')
const COUNT = document.getElementById('story-count')
const TOTAL = document.getElementById('story-total')
const TOGGLE = document.getElementById('toggle-darkmode')


/**
 * Get a single story.
 * @param {number} storyIdNumber - The id of the story
 * @returns {object} the story object
 */
const getStory = async (storyIdNumber) => {  
  const story = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIdNumber}.json?print=pretty`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {      
      return data;
    });

  return story;
}


/**
 * Build a custom dom node from a comment object.
 * @param {object} commentObject - The id of the story
 * @returns {html object} the dom element housing the comment html
 */
const buildCommentHTML = (commentObject) => {
  let author = commentObject.by;
  let text = commentObject.text;  

  // Validation
  if (!commentObject) return false;
  if (commentObject.deleted === true) return false;

  // create div
  const parent = document.createElement('div');
  
  // create author p
  const child1 = document.createElement('p');
  child1.classList.add('comment-author')
  child1.innerText = author;
  
  // create author text
  const child2 = document.createElement('div');
  child2.innerHTML = text;

  // TODO: Fix first childnode of comment (it's always an invalid text string)
  parent.appendChild(child1)
  parent.appendChild(child2)

  return parent;
}


/**
 * Render comments tree, handle children of comments as-well.
 * @param {array} commentsArray - The array of comments ex: [123123123, 123123123]
 * @param {number} elementIdNumber - The id of the story. Not null, when function recursively calls itself (because it's a child of another comment)
 */
const renderComments = async (commentsArray, elementIdNumber = null) => { 
  const isNested = elementIdNumber ? true : false;
  const COMMENT_PARENT = document.getElementById('story-comments');
  const PARENT = elementIdNumber ? document.getElementById(elementIdNumber) : COMMENT_PARENT;  
  
  // Remove comments if incoming array is empty.
  if (commentsArray.length === 0) {    
    COMMENT_PARENT.innerHTML = '';
    return;
  }
  
  // Cancel render (need to cancel usually when switching stories. Comments keep trying to render.)
  if (!PARENT) return;
  
  let comments = await Promise.all(
    commentsArray.map(async commentID => {
      let commentsResponse = await getStory(commentID)
      return commentsResponse;
    })
  )

  // Handle HTML 
  comments.forEach((comment) => {
    // Validation
    if (!comment) return;
    if (comment.deleted === true) return;
    
    // Create the list item
    const LIST_ITEM = document.createElement('li');
    
    // Styling
    LIST_ITEM.classList.add('story-comment');
    // Set list item content:
    LIST_ITEM.id = comment.id; 
    
    // Build List Item content
    const COMMENT_CONTENT = buildCommentHTML(comment)
    LIST_ITEM.appendChild(COMMENT_CONTENT);

    // If nested, create another <ul> and put the comment in there.
    if (isNested) {
      const LIST = document.createElement('ul');
      LIST.classList.add('list-comment');

      PARENT.appendChild(LIST);
      LIST.appendChild(LIST_ITEM)
    }  else {
      // Append list items to ul
      PARENT.appendChild(LIST_ITEM);
    }

    // If this comment has children itself, call parent function again...
    if (comment.kids) {
      // Recursion
      renderComments(comment.kids, comment.id)
    }
  })
}


/**
 * Render current story, add UX stuff at the same time.
 * @param {array} storyArray - The array of stories ex: [123123123, 123123123]
 */
const renderCurrentStory = async (storyArray) => {
  const currentStoryIndex = localStorage.getItem('currentStoryIndex');
  const currentStoryID = storyArray[currentStoryIndex]
  const story = await getStory(currentStoryID)  

  const hasText = story.text === undefined ? false : true;
  const hasComments = story.kids && story.kids.length >= 1 ? true : false;
  const content = hasText ? story.text : story.url
  
  // Set title html
  TITLE.innerHTML = story.title;
  HN_LINK.href = `https://news.ycombinator.com/item?id=${story.id}`;

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

  if (hasComments) {  
    localStorage.setItem('currentStoryComments', story.kids)
  }
}


/**
 * Attach event listeners to the document, used for key navigation
 * @param {array} storyArray - The array of stories ex: [123123123, 123123123], used to call render with accurate data. (didn't want to store in memory)
 */
const attachEventListeners = (storiesArray) => {
  const stories = storiesArray;

  document.onkeydown = (e) => {
    const totalStoryIndex = localStorage.getItem('topStoriesLength');
    const currentStoryIndex = localStorage.getItem('currentStoryIndex');
    const currentStoryComments = localStorage.getItem('currentStoryComments');

    // LEFT
    if (e.keyCode == '37') {
      if (currentStoryIndex < 1) {        
        return;
      }
      
      // Store in memory
      let newIndex = Number(currentStoryIndex) - 1
      localStorage.setItem('currentStoryIndex', newIndex);
      localStorage.removeItem('currentStoryComments');

      // Update count dom node
      COUNT.innerHTML = newIndex;
      TITLE.innerHTML = "";
      URL.innerHTML = "";
      TEXT.innerHTML = "Loading...";
      HN_LINK.href = ``;
      
      // Re-render page on navigation
      renderCurrentStory(stories);
      renderComments([]);
    }
    
    
    // RIGHT
    else if (e.keyCode == '39') {
      if (currentStoryIndex >= totalStoryIndex - 1) {        
        return;
      }
      
      // Store in memory
      let newIndex = Number(currentStoryIndex) + 1
      localStorage.removeItem('currentStoryComments');
      localStorage.setItem('currentStoryIndex', newIndex);
      
      // Update count dom node
      COUNT.innerHTML = newIndex;
      TITLE.innerHTML = "";
      URL.innerHTML = "";
      TEXT.innerHTML = "Loading...";
      HN_LINK.href = ``;

      // Re-render page on navigation      
      renderCurrentStory(stories);
      renderComments([]);
    }

    // DOWN (render comments)
    else if (e.keyCode == '40' && currentStoryComments) {
      const commentsArray = currentStoryComments.split(',')
      
      // Re-render page on navigation
      renderComments(commentsArray);
    }
  };


  // Story Reset
  RESET.onmousedown = (e) => {
    localStorage.setItem('currentStoryIndex', 0);
    COUNT.innerHTML = 0;
    renderCurrentStory(stories);
    renderComments([]);
  }

  // Darkmode switch
  TOGGLE.onmousedown = (e) => {
    if (BODY.classList.contains('darkmode-on')) {
      BODY.classList.remove('darkmode-on')
      localStorage.setItem('darkmodeStatus', false);
    } else {
      BODY.classList.add('darkmode-on')
      localStorage.setItem('darkmodeStatus', true);
    }
  }
}


/**
 * Get the top stories. This is the first call, and 
 * @returns {array} the stories array ex: [123123,1231231] 
 */
const getTopStories = async () => {  
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

      // Update count html
      COUNT.innerHTML = currentStoryIndex;
      TOTAL.innerHTML = data.length;
      
      return data;
    });
  
  return stories;
}


/**
 * Initiation
 */
(async function() { 
  // Handle darkmode switching, and saving of state.
  const darkmodeStatus = localStorage.getItem('darkmodeStatus');  
  let darkmode = (darkmodeStatus === 'true' ? true : false);
  
  if (darkmode) {    
    BODY.classList.add('darkmode-on')
    localStorage.setItem('darkmodeStatus', true);
  } else {
    BODY.classList.remove('darkmode-on')
    localStorage.setItem('darkmodeStatus', false);
  }

  const storiesArray = await getTopStories()
  await renderCurrentStory(storiesArray)
  attachEventListeners(storiesArray)  
})();