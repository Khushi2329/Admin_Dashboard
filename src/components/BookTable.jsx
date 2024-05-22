// src/components/BookTable.js
import React, { useEffect, useState } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { CSVLink } from 'react-csv';
import { fetchBooks, fetchAuthorDetails } from '../services/bookService';

const BookTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('the+lord+of+the+rings');
  const [editRow, setEditRow] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching books...');  // Debugging
        const bookData = await fetchBooks(searchTerm);
        console.log('Books fetched:', bookData);  // Debugging
        const booksWithAuthors = await Promise.all(
          bookData.docs.map(async (book) => {
            const authorKey = book.author_key && book.author_key[0];
            if (!authorKey) {
              return {
                ...book,
                author_name: 'Unknown',
                author_birth_date: 'Unknown',
                author_top_work: 'Unknown',
              };
            }
            console.log('Fetching author details for:', authorKey);  // Debugging
            const author = await fetchAuthorDetails(authorKey);
            console.log('Author details:', author);  // Debugging
            return {
              ...book,
              author_name: author.name,
              author_birth_date: author.birth_date,
              author_top_work: author.top_work,
            };
          })
        );
        setData(booksWithAuthors);
      } catch (err) {
        console.error('Failed to fetch books:', err);  // Debugging
        setError('Failed to fetch books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, pageSize, searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Searching books...');  // Debugging
      const bookData = await fetchBooks(searchTerm);
      console.log('Search results:', bookData);  // Debugging
      const booksWithAuthors = await Promise.all(
        bookData.docs.map(async (book) => {
          const authorKey = book.author_key && book.author_key[0];
          if (!authorKey) {
            return {
              ...book,
              author_name: 'Unknown',
              author_birth_date: 'Unknown',
              author_top_work: 'Unknown',
            };
          }
          console.log('Fetching author details for:', authorKey);  // Debugging
          const author = await fetchAuthorDetails(authorKey);
          console.log('Author details:', author);  // Debugging
          return {
            ...book,
            author_name: author.name,
            author_birth_date: author.birth_date,
            author_top_work: author.top_work,
          };
        })
      );
      setData(booksWithAuthors);
    } catch (err) {
      console.error('Failed to search books:', err);  // Debugging
      setError('Failed to search books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Title', accessor: 'title' },
      { Header: 'Author', accessor: 'author_name' },
      { Header: 'First Publish Year', accessor: 'first_publish_year' },
      { Header: 'Subject', accessor: 'subject' },
      { Header: 'Ratings Average', accessor: 'ratings_average' },
      { Header: 'Author Birth Date', accessor: 'author_birth_date' },
      { Header: 'Author Top Work', accessor: 'author_top_work' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page: tablePage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex, pageSize: tablePageSize },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize: setTablePageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      manualPagination: true,
      pageCount: Math.ceil(data.length / pageSize),
    },
    useSortBy,
    usePagination
  );

  const handleEditSave = (rowIndex) => {
    setEditRow(null);
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by author"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <CSVLink data={data} filename="books.csv" className="csv-download">
          Download CSV
        </CSVLink>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {tablePage.map((row, i) => {
                prepareRow(row);
                const isEditing = editRow === i;
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={cell.value}
                            onBlur={(e) => {
                              row.values[cell.column.id] = e.target.value;
                            }}
                          />
                        ) : (
                          cell.render('Cell')
                        )}
                      </td>
                    ))}
                    <td>
                      {isEditing ? (
                        <button onClick={() => handleEditSave(i)}>Save</button>
                      ) : (
                        <button onClick={() => setEditRow(i)}>Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              Previous
            </button>
            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </span>
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              Next
            </button>
            <select
              value={tablePageSize}
              onChange={(e) => setTablePageSize(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default BookTable;
