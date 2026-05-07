import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import Select from 'react-select';
import { countryOptions, languageOptions, continentOptions } from '../data/options';
import { MagnifyingGlassIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'var(--bg-select, #ffffff)',
        borderColor: state.isFocused ? '#7E57C2' : 'var(--border-select, #E5E7EB)',
        borderRadius: '1rem',
        padding: '2px',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(126, 87, 194, 0.2)' : 'none',
        transition: 'all 0.2s ease',
    }),
    singleValue: (provided) => ({ ...provided, color: 'var(--text-select, #1F2937)' }),
    placeholder: (provided) => ({ ...provided, color: '#9CA3AF' }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'var(--bg-menu, #ffffff)',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#7E57C2' : isFocused ? 'var(--bg-option-hover, #F3F4F6)' : 'transparent',
        color: isSelected ? 'white' : 'var(--text-select, #1F2937)',
        cursor: 'pointer',
        padding: '10px 15px',
    }),
};

const DiscoverPage = () => {
    const [filters, setFilters] = useState({ continent: null, country: null, language: null });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const filteredCountryOptions = useMemo(() => {
        if (!filters.continent) return countryOptions;
        return countryOptions.filter(country => country.continents && country.continents.includes(filters.continent.value));
    }, [filters.continent]);

    const handleFilterChange = (name, selectedOption) => {
        const newFilters = { ...filters, [name]: selectedOption };
        if (name === 'continent') newFilters.country = null;
        setFilters(newFilters);
    };

    const handleSearch = async () => {
        setLoading(true); setSearched(true); setResults([]);
        try {
            let countryQuery = null;
            let languageQuery = null;
            
            // 🔥 Hem kodu (CN) hem adı (China) gönderiyoruz ki kaçarı olmasın 🔥
            if (filters.country) {
                countryQuery = `${filters.country.value},${filters.country.label}`;
            } else if (filters.continent) {
                const countriesInContinent = countryOptions.filter(c => c.continents && c.continents.includes(filters.continent.value));
                if (countriesInContinent.length > 0) {
                    countryQuery = countriesInContinent.map(c => `${c.value},${c.label}`).join(',');
                }
            }

            if (filters.language) {
                languageQuery = `${filters.language.value},${filters.language.label}`;
            }

            const searchParams = {
                country: countryQuery,
                language: languageQuery
            };
            
            Object.keys(searchParams).forEach(key => {
                if (!searchParams[key]) delete searchParams[key];
            });

            const users = await userService.findUsers(searchParams);
            setResults(users);
        } catch (error) { console.error("Search error:", error); } 
        finally { setLoading(false); }
    };

    return (
        <div className="py-12 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <style>{`.dark { --bg-select: #374151; --border-select: #4B5563; --text-select: #F3F4F6; --bg-menu: #1F2937; --bg-option-hover: #4B5563; }`}</style>
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-monster-purple to-blue-500 mb-4">Discover Partners</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">Find people from all around the world, filter by continent or language, and start making global friends today.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl mb-12 border border-gray-100 dark:border-gray-700 relative z-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1.5"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-2">Continent</label><Select styles={customSelectStyles} options={continentOptions} onChange={(option) => handleFilterChange('continent', option)} value={filters.continent} placeholder="Any Continent" isClearable /></div>
                        <div className="flex flex-col space-y-1.5"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-2">Country</label><Select styles={customSelectStyles} options={filteredCountryOptions} onChange={(option) => handleFilterChange('country', option)} value={filters.country} placeholder="Any Country" isClearable /></div>
                        <div className="flex flex-col space-y-1.5"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-2">Language</label><Select styles={customSelectStyles} options={languageOptions} onChange={(option) => handleFilterChange('language', option)} value={filters.language} placeholder="Any Language" isClearable /></div>
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={handleSearch} disabled={loading} className="bg-gradient-to-r from-monster-purple to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-extrabold py-3.5 px-10 rounded-full transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center mx-auto space-x-2">
                            {loading ? (<><div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div><span>Searching...</span></>) : (<><MagnifyingGlassIcon className="h-5 w-5" /><span>Search Global</span></>)}
                        </button>
                    </div>
                </div>

                <div>
                    {!loading && searched && results.length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"><GlobeAltIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" /><h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Adventurers Found</h3><p className="text-gray-500 dark:text-gray-400">Try changing your filters to discover more people.</p></div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {results.map(user => {
                            const countryLabel = countryOptions.find(c => c.label.includes(user.country))?.label || user.country;
                            return (
                                <Link to={`/profile/${user._id}`} key={user._id} className="block group">
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                                        <div className="h-24 w-full bg-gradient-to-r from-monster-purple/80 to-blue-500/80 relative">
                                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                                                <img src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR} alt={user.username} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md group-hover:scale-105 transition-transform" />
                                            </div>
                                        </div>
                                        <div className="pt-14 pb-6 px-6 text-center flex-grow flex flex-col">
                                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-monster-purple transition-colors">{user.username}</h3>
                                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">{countryLabel}</p>
                                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                                {user.spokenLanguages?.slice(0, 3).map(lang => (<span key={lang} className="bg-purple-50 dark:bg-gray-700 text-monster-purple dark:text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">{lang}</span>))}
                                                {user.spokenLanguages?.length > 3 && (<span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2.5 py-1 rounded-full">+{user.spokenLanguages.length - 3}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscoverPage;