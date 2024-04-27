document
  .querySelector(".upper_card")
  .addEventListener("mouseover", function () {
    this.querySelector("img").src = "./img/pen-hover.svg";
  });

document.querySelector(".upper_card").addEventListener("mouseout", function () {
  this.querySelector("img").src = "./img/pencil_summary.svg";
});

document.querySelector('.upper_card:nth-child(2)').addEventListener('mouseover', function() {
    this.querySelector('img').src = './img/done-hover.svg';
  });
  
  document.querySelector('.upper_card:nth-child(2)').addEventListener('mouseout', function() {
    this.querySelector('img').src = './img/done_summary.svg';
  });