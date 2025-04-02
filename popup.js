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
    utterance.lang = 'en-US'; // Set default language
    utterance.rate = 1; // Normal speed
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Please select some text first!');
  }
}
  