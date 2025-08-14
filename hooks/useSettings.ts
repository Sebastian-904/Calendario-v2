
import { useState } from 'react';
import type { Categories, Template } from '../types';
import { DEFAULT_CATEGORIES, seedTemplates } from '../data/seedData';

export const useSettings = () => {
    const [categories, setCategories] = useState<Categories>(DEFAULT_CATEGORIES);
    const [templates, setTemplates] = useState<Template[]>(seedTemplates);
    const [isTplModalOpen, setTplModalOpen] = useState(false);

    return {
        categories,
        setCategories,
        templates,
        setTemplates,
        isTplModalOpen,
        setTplModalOpen
    };
};
