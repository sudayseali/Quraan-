/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SurahView } from './pages/SurahView';
import { Bookmarks } from './pages/Bookmarks';
import { Search } from './pages/Search';
import { QuranProvider } from './context/QuranContext';

export default function App() {
  return (
    <QuranProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surah/:id" element={<SurahView />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QuranProvider>
  );
}
