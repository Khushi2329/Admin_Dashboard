// src/services/bookService.js
import axios from 'axios';

const API_URL = 'https://openlibrary.org';

export const fetchBooks = async (query) => {
  try {
    const url = `${API_URL}/search.json?q=${query}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const fetchAuthorDetails = async (authorKey) => {
  try {
    const url = `${API_URL}/authors/${authorKey}.json`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching author details:", error);
    throw error;
  }
};
