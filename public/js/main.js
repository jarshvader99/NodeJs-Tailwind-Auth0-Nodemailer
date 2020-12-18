document.querySelector('#checkbox').addEventListener('change', () => {
  document.querySelector('.container-mode-toggle').classList.toggle('dark');
  document.querySelector('#shadow-container').classList.toggle('shadow-lg');
  document.querySelector('#shadow-container').classList.toggle('dark-shadow');
})

let toolsLabel = document.getElementById("tools-label");
// This handler will be executed every time the cursor
// is moved over a different list item
if (toolsLabel != null) {
  toolsLabel.addEventListener("mouseover", function (event) {
    // highlight the mouseover target  
    event.target.classList = "animate-ping";

    // reset the color after a short delay
    setTimeout(function () {
      event.target.classList = "block text-indigo-600 xl:inline";
    }, 500);
  }, false);
}

function edit(id) {
  var newId = id.substring(10);
  document.getElementById('hidden-input-' + newId).style = "display:unset;";
  document.getElementById('task-item-' + newId).style = 'display:none';
}

function cancelEdit(id) {
  document.getElementById('hidden-input-' + id).style = "display:none";
  document.getElementById('task-item-' + id).style = '';
}

var mySwiper = new Swiper('.swiper-container', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,

  autoplay: {
    delay: 5000,
  },

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  scrollbar: {
    el: '.swiper-scrollbar',
  },
});
