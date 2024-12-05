const express = require('express');
const axios = require('axios');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    let url = 'https://api.themoviedb.org/3/movie/558449?api_key=37c52736899600ac82440a953d6f4175';
    axios.get(url)
    .then(response => {
        let data = response.data;
        let releaseDate = new Date(data.release_date).getFullYear();

        let genres = '';
        data.genres.forEach(genre => {
            genres = genres + `${genre.name}, `;
        });


        let genresUpdated = genres.slice(0, -2) + '.';
        let posterUrl = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`;

        let currentYear = new Date().getFullYear();

        res.render('index', { 
            dataToRender: data,
            year: currentYear, 
            releaseYear: releaseDate,
            genres: genresUpdated,
            poster: posterUrl
        }); 
    })
    .catch(error => {
        console.error('Error fetching data:', error.message);
        res.status(500).send('Something went wrong while fetching movie data.'); 
    });
});

app.get('/search', (req, res) => {
    res.render('search', { movieDetails:''});
});

app.post('/search', (req, res) => {
    let userMovieTitle = req.body.movieTitle;
    


    let movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=37c52736899600ac82440a953d6f4175&query=${userMovieTitle}`;
    let genresUrl = 'https://api.themoviedb.org/3/genre/movie/list?api_key=37c52736899600ac82440a953d6f4175&language=en';

    let endpoints = [movieUrl, genresUrl];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    .then(axios.spread((movie, genres)=> {

        const [movieRaw] = movie.data.results;
        let movieGenres = genres.data.genres;
        let movieGenreIds = movieRaw.genre_ids;
        
        let movieGenresArray = [];

        for(let i = 0; i < movieGenreIds.length; i++) {
            for(let j = 0; j < movieGenres.length; j++) {
                if(movieGenreIds[i] === movieGenres[j].id) {
                    movieGenresArray.push(movieGenres[j].name);
                }
            }
        }
        
        let genresToDisplay = '';
        movieGenresArray.forEach(genre => {
            genresToDisplay = genresToDisplay+ `${genre}, `;
        });

        genresToDisplay = genresToDisplay.slice(0, -2) + '.';

        let movieData = {
            title: movieRaw.title,
            year: new Date(movieRaw.release_date).getFullYear(),
            genres: genresToDisplay,
            overview: movieRaw.overview,
            posterUrl: `https://image.tmdb.org/t/p/w500${movieRaw.poster_path}`,
            
        };

        res.render('search', {movieDetails: movieData});



    }));
    
   

    
});



app.listen(process.env.PORT||3000, () => {
    console.log('Server is running on port 3000.');
});

//week12