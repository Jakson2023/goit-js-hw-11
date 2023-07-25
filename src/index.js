import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.css';
import Notiflix from 'notiflix';
Notiflix.Notify.init({
  width: '360px',
  position: 'center-center',
  distance: '50px',
  opacity: 1,
  fontSize: '20px',
});

const elements = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  load: document.querySelector('.load-more'),
  input: document.querySelector('input'),
};

elements.load.addEventListener('click', onLoadMore);
elements.form.addEventListener('submit', hendlerSearch);

elements.load.hidden = true;
elements.load.style.display = 'none';

async function hendlerSearch(e) {
  e.preventDefault();
  const { searchQuery } = e.currentTarget.elements;
  const searchValue = searchQuery.value.trim();

  if (searchValue) {
    serviceReq(searchValue);
    clearGallery();
  } else {
    Notiflix.Notify.failure('Please enter your request');
  }
  page = 1;
}

let page = 1;
async function onLoadMore() {
  let currentValue = elements.input.value;
  page += 1;
  await serviceReq(currentValue, page);
}

async function serviceReq(search, page = 1) {
  const response = await axios({
    method: 'get',
    baseURL: 'https://pixabay.com/api/',
    params: {
      key: '38392384-4306dcd0758c0a555545ea085',
      q: search,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: page,
    },
  });

  const perPageValue = response.config.params.per_page;

  if (response.data.hits.length === 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  } else {
    elements.load.hidden = false;
    elements.load.style.display = 'block';
  }
  if (perPageValue * page >= response.data.totalHits && response.data.totalHits !== 0) {
    elements.load.hidden = true;
    elements.load.style.display = 'none';
    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
  }
  if (page === 1 && response.data.totalHits !== 0) {
    Notiflix.Notify.info(`Hooray! We found ${response.data.totalHits} images.`);
  }
  if (response.data.hits.length < perPageValue) {
    elements.load.style.display = 'none';
    elements.load.hidden = true;
  }
  elements.gallery.insertAdjacentHTML('beforeend',createMarkup(response.data.hits));
  new SimpleLightbox('.gallery a ', { captionDelay: 250 });
}

function createMarkup(arr) {
  return arr
    .map(({webformatURL,largeImageURL,tags,downloads,comments,views,likes,}) => `
            <div class="photo-card">
            <a class="gallery__link" href="${largeImageURL}" >
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
              <p class="info-item">
                <b>Likes: ${likes}</b>
              </p>
              <p class="info-item">
                <b>Views: ${views}</b>
              </p>
              <p class="info-item">
                <b>Comments: ${comments}</b>
              </p>
              <p class="info-item">
                <b>Downloads: ${downloads}</b>
              </p>
            </div>
          </div>`
    )
    .join('');
}

function clearGallery() {
  elements.gallery.innerHTML = '';
}
