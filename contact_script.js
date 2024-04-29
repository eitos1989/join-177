function createCard() {
  let overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  let card = document.createElement("div");
  card.className = "card_template";
  card.innerHTML = `
      <div class="left_collumn">
        <img src="./img/join_white_logo.svg" alt="Join_logo" />
        <h1>Add contact</h1>
        <h3>Tasks are better with a team!</h3>
        <div class="blue_seperator_card"></div>
      </div>
      <div class="flex_row">
        <img class="empty_user_img" src="./img/empty_user_img.svg" alt="empty_profile picture" />
        <form class="contact_details_collumn">
           <div class="input-with-image">
          <input type="text" id="name" name="name" placeholder="Name" autocomplete="name" />
          </div>
          <div class="input-with-image_1">
          <input type="email" id="email" name="email" placeholder="Email" autocomplete="email" />
          </div>
          <div class="input-with-image_2">
          <input type="tel" id="phone" name="phone" placeholder="Phone" autocomplete="tel" />
          </div>
          <div class="button_row">
            <button class="cancel_but">
              cancel
              <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.001 6.50008L12.244 11.7431M1.758 11.7431L7.001 6.50008L1.758 11.7431ZM12.244 1.25708L7 6.50008L12.244 1.25708ZM7 6.50008L1.758 1.25708L7 6.50008Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button class="create__contact_but" type="submit">
              Create contact
              <img src="./img/create_contact_check.svg" alt="cancel_button_img" />
            </button>
          </div>
        </form>
      </div>
    `;
  document.body.appendChild(card);
}

//hover effects for images of edit and delete buttons

document
  .querySelector('img[src="./img/edit_pen_white.svg"]')
  .addEventListener("mouseover", function () {
    this.src = "./img/edit_pen_blue.svg"; // Replace with the path to your hover image
  });

document
  .querySelector('img[src="./img/edit_pen_white.svg"]')
  .addEventListener("mouseout", function () {
    this.src = "./img/edit_pen_white.svg";
  });

document
  .querySelector('img[src="./img/delete_basket_white.svg"]')
  .addEventListener("mouseover", function () {
    this.src = "./img/delete_basket_blue.svg"; // Replace with the path to your hover image
  });

document
  .querySelector('img[src="./img/delete_basket_white.svg"]')
  .addEventListener("mouseout", function () {
    this.src = "./img/delete_basket_white.svg";
  });
