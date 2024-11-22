import axios from 'axios';
import { getMoviesByYear } from '../movieService';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getMoviesByYear', () => {
  it('should return movies with editors', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [{ id: 1, title: 'Movie1', release_date: '2020-01-01', vote_average: 8.1 }] },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        crew: [
          { known_for_department: 'Editing', name: 'Editor1' },
          { known_for_department: 'Editing', name: 'Editor2' },
        ],
      },
    });

    const movies = await getMoviesByYear(2020);
    expect(movies).toEqual([
      {
        'status': 'fulfilled',
        value: {
          title: 'Movie1',
          release_date: '2020-01-01',
          vote_average: 8.1,
          editors: ['Editor1', 'Editor2'],
        },
      },
    ]);
  });

  it('should return movies without editors if credits API fails', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [{ id: 1, title: 'Movie1', release_date: '2020-01-01', vote_average: 8.1 }] },
    });

    mockedAxios.get.mockRejectedValueOnce(new Error('Credits API failed'));

    const movies = await getMoviesByYear(2020);
    expect(movies).toEqual([
      {
        'status': 'fulfilled',
        value: {
          title: 'Movie1',
          release_date: '2020-01-01',
          vote_average: 8.1,
          editors: [],
        },
      },
    ]);
  });
});
