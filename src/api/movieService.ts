import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type MOVIE = {
  title: string;
  id: string;
  release_date: string;
  vote_average: string;
};

type CREW = {
  known_for_department: string;
};
type EDITOR = {
  name: string;
};
type EDITORS = Array<EDITOR>;

type MOVIESRESPONSE = Omit<MOVIE, 'id'> & {
  editors: EDITORS | [];
};

const getMoviesByYear = async (
  year: number,
): Promise<PromiseSettledResult<MOVIESRESPONSE>[]> => {
  const apiKey = process.env.TMDB_API_KEY || '';

  return axios.get(`${TMDB_BASE_URL}/discover/movie`, {
    params: {
      language: 'en-US',
      primary_release_year: year,
      sort_by: 'popularity.desc',
      page: 1,
    },
    headers: {
      Authorization: `Bearer  ${apiKey}`,
    },
  }).then((movieResponse) => {
    const movies = movieResponse.data.results;
    const enrichedMoviesPromise: Promise<MOVIESRESPONSE>[] = movies.map(
      (movie: MOVIE) => {
        return axios
          .get(`${TMDB_BASE_URL}/movie/${movie.id}/credits`, {
            headers: {
              Authorization: `Bearer  ${apiKey}`,
            },
          })
          .then((response) => {
            const editors: EDITORS = response.data.crew
              .filter((crew: CREW) => crew.known_for_department === 'Editing')
              .map((editor: EDITOR) => editor.name);

            return {
              title: movie.title,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              editors,
            };
          })
          .catch(() => {
            return {
              title: movie.title,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              editors: [],
            };
          });
      },
    );
    return Promise.allSettled(enrichedMoviesPromise);
  }).catch((error) => {
    console.error(error);
    throw new Error('Failed to fetch movies');
  });
};

export { getMoviesByYear };
