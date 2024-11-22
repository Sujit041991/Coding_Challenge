import express, { Request, Response } from 'express';
import { getMoviesByYear } from './api/movieService';

require('dotenv').config();

const app = express();

function isFulfilled<T>(
  val: PromiseSettledResult<T>,
): val is PromiseFulfilledResult<T> {
  return val.status === 'fulfilled';
}

app.get('/', async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string);
  if (!year || isNaN(year))
    return res.status(400).send({ error: 'Invalid year parameter' });

  try {
    const response = await getMoviesByYear(year);
    const movies = response
      .filter((promiseResult) => isFulfilled(promiseResult))
      .map((promiseData) => promiseData.value);
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve' });
  }
});

export default app;
