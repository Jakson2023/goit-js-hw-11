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

async function hendlerSearch(e) {
  e.preventDefault();
  const { searchQuery } = e.currentTarget.elements;
  serviceReq(searchQuery.value);
  clearGallery();
}

let page = 1;
async function onLoadMore() {
  let currentValue = elements.input.value;
  page += 1;
  await serviceReq(currentValue, page);
}


async function serviceReq(search, page = 1) {
  // try {
  const response = await axios({
    method: 'get',
    baseURL: 'https://pixabay.com/api',
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
  
  if (response.status === 200 && response.data.hits.length !== 0) {
    elements.load.hidden = false;
    elements.load.style.display = 'block';
  }
  if (response.data.hits.length === 0) {
    elements.load.style.display = 'none';
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }
  if (response.data.hits.length * page > response.data.totalHits) {
    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
    elements.load.hidden = true;
  }
  elements.gallery.insertAdjacentHTML('beforeend',createMarkup(response.data.hits));
  let gallery = new SimpleLightbox('.gallery a ', { captionDelay: 250 });
  

  // catch (error) {
  //   console.log(error);
  // }

}

function createMarkup(arr) {
  return arr
    .map(
      ({webformatURL,largeImageURL,tags,downloads,comments,views,likes,}) => `
            <div class="photo-card">
            <a class="gallery__link" href="${largeImageURL}" >
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
              <p class="info-item">
                <b>Likes ${likes}</b>
              </p>
              <p class="info-item">
                <b>Views ${views}</b>
              </p>
              <p class="info-item">
                <b>Comments ${comments}</b>
              </p>
              <p class="info-item">
                <b>Downloads ${downloads}</b>
              </p>
            </div>
          </div>`
    )
    .join('');
}

function clearGallery() {
  elements.gallery.innerHTML = '';
}
