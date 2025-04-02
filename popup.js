document.getElementById("change-colors").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: changeColors,
      });
    });
  });
  
// document.getElementById("enlarge-fonts").addEventListener("click", () => {
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript({
//     target: { tabId: tabs[0].id },
//     func: enlargeFonts,
//     });
// });
// });

document.getElementById("font-size-slider").addEventListener("input", (event) => {
  let fontSize = event.target.value + "px";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: enlargeFonts,
          args: [fontSize]
      });
  });
});

document.getElementById("toggle-zen-preview").addEventListener("click", () => {
  let isEnabled = localStorage.getItem("zenPreviewEnabled") === "true";
  let newState = !isEnabled;
  localStorage.setItem("zenPreviewEnabled", newState);
  
  // change the button appearance maybe? FIX: DONE
  let button = document.getElementById("toggle-zen-preview");
  button.style.backgroundColor = newState ? "#4CAF50" : "#f44336";
  
  // remove and inject the preview window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: injectZenPreviewFeature,
      args: [newState]
    });
  });
});

document.getElementById("read-aloud").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: speakSelectedText,
    });
  });
});

document.getElementById("toggle-menu").addEventListener("click", () => {
  let submenu = document.getElementById("submenu");
  submenu.style.display = submenu.style.display === "none" ? "block" : "none";
});

document.getElementById("toggle-dyslexia-font").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: toggleDyslexiaFont,
    });
  });
});

function toggleDyslexiaFont() {
  let styleId = "dyslexia-font-style";
  let linkId = "dyslexia-font-link";
  let existingStyle = document.getElementById(styleId);
  let existingLink = document.getElementById(linkId);

  if (existingStyle) {
    existingStyle.remove();
    if (existingLink) existingLink.remove();
  } else {
    let link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.min.css";
    document.head.appendChild(link);
    
    let style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = "* { font-family: 'OpenDyslexicRegular', 'Comic Sans MS', sans-serif !important; }";
    document.head.appendChild(style);
  }
}
  
function changeColors() {
document.body.style.backgroundColor = "rgb(35,43,43)";
document.querySelectorAll("*").forEach((el) => {
    el.style.backgroundColor = "rgb(35, 43, 43)"
    el.style.color = "rgb(211,236,225)";
});
}

// DON'T UNCOMMENT, FINAL RUN : PREVIOUS USE, not needed
// function enlargeFonts() {
// document.querySelectorAll("*").forEach((el) => {
//     el.style.fontSize = "28px";
// });
// }

function enlargeFonts(fontSize) {
  document.querySelectorAll("*").forEach((el) => {
      el.style.fontSize = fontSize;
  });
}

function speakSelectedText() {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText) {
    const utterance = new SpeechSynthesisUtterance(selectedText);
    utterance.lang = 'en-US'; 
    utterance.rate = 1; 
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Please select some text first!');
  }
} 

function injectZenPreviewFeature(enable) {
  const existingContainer = document.getElementById("zen-glance-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  // if auser disables, then just return kar do 
  if (!enable) return;
  
  // glance container created here
  let glanceContainer = document.createElement("div");
  glanceContainer.id = "zen-glance-container";
  glanceContainer.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: white;
    border: 2px solid #357ABD;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    display: none;
    border-radius: 8px;
    overflow: hidden;
  `;
  document.body.appendChild(glanceContainer);

  // ctrl + shift + click to handle the event
  document.addEventListener("click", (event) => {
    if (event.ctrlKey && event.shiftKey && event.target.closest("a")) {
      event.preventDefault();
      const link = event.target.closest("a");
      showGlance(link.href);
    }
  }); 

  function showGlance(url) {
    glanceContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; background: #357ABD; padding: 10px; color: white;">
        <span>Preview: ${url}</span>
        <div>
          <button id="expand-glance" style="margin-right: 10px; background: transparent; border: 1px solid white; color: white; cursor: pointer; padding: 3px 8px; border-radius: 3px;">Open Tab</button>
          <button id="close-glance" style="background: transparent; border: 1px solid white; color: white; cursor: pointer; padding: 3px 8px; border-radius: 3px;">✕</button>
        </div>
      </div>
      <iframe id="glance-iframe" src="${url}" style="width:100%; height:calc(100% - 40px); border: none;"></iframe>
    `;
    
    glanceContainer.style.display = "block";
    
    document.getElementById("close-glance").addEventListener("click", () => {
      glanceContainer.style.display = "none";
    });
  
    document.getElementById("expand-glance").addEventListener("click", () => {
      window.open(url, '_blank');
      glanceContainer.style.display = "none";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && glanceContainer.style.display === "block") {
      glanceContainer.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("toggle-zen-preview")) {
    const zenButton = document.createElement("button");
    zenButton.id = "toggle-zen-preview";
    zenButton.textContent = "Enable Link Preview (ctrl+shift)";
    zenButton.style.backgroundColor = localStorage.getItem("zenPreviewEnabled") === "true" ? "#4CAF50" : "#f44336";
    zenButton.style.color = "white";
    
    document.getElementById("submenu").appendChild(zenButton);
    
    zenButton.addEventListener("click", () => {
      let isEnabled = localStorage.getItem("zenPreviewEnabled") === "true";
      let newState = !isEnabled;
      localStorage.setItem("zenPreviewEnabled", newState);
      
      zenButton.style.backgroundColor = newState ? "#4CAF50" : "#f44336";
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: injectZenPreviewFeature,
          args: [newState]
        });
      });
    });
  }
  
  if (localStorage.getItem("zenPreviewEnabled") === "true") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: injectZenPreviewFeature,
        args: [true]
      });
    });
  }
});