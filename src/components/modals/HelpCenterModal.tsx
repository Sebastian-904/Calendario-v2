import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, ChevronRight, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.tsx';
import type { Role } from '../../types.ts';
import { helpContent, type HelpTopic } from '../../data/helpContent.ts';
import { classNames } from '../../utils/helpers.ts';
import Button from '../ui/Button.tsx';

interface HelpCenterModalProps {
    open: boolean;
    onClose: () => void;
    role: Role;
}

const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ open, onClose, role }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

    const relevantTopics = useMemo(() => {
        const userRole = (role === 'consultor' || role === 'admin') ? 'consultor' : 'client';
        return helpContent[userRole] || [];
    }, [role]);

    useEffect(() => {
        if(relevantTopics.length > 0) {
            setSelectedTopic(relevantTopics[0]);
        }
    }, [relevantTopics]);
    
     useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    const filteredTopics = useMemo(() => {
        if (!searchTerm) return relevantTopics;
        return relevantTopics.filter(topic =>
            topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            topic.content.some(block => {
                if (block.type === 'h2' || block.type === 'h3' || block.type === 'p') {
                    return block.text.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (block.type === 'list') {
                    return block.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
                }
                return false;
            })
        );
    }, [searchTerm, relevantTopics]);

    if (!open) return null;

    const renderContentBlock = (block: HelpTopic['content'][0], index: number) => {
        switch(block.type) {
            case 'h2':
                return <h2 key={index} className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mt-6 mb-3">{block.text}</h2>;
            case 'h3':
                 return <h3 key={index} className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-4 mb-2">{block.text}</h3>;
            case 'p':
                return <p key={index} className="text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.text }} />;
            case 'list':
                return (
                    <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-zinc-600 dark:text-zinc-300 pl-4">
                        {block.items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
                    </ul>
                );
            default:
                return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl h-[80vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                        <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{t('help_center.title')}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title={t('general.close')}><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-grow flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder={t('help_center.search_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700"
                            />
                        </div>
                        <nav className="flex-grow overflow-y-auto space-y-1 pr-1">
                            {filteredTopics.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={classNames(
                                        "w-full text-left flex items-center justify-between p-2 rounded-lg transition-colors text-sm",
                                        selectedTopic?.id === topic.id
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                            : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                   <div className="flex items-center gap-3">
                                       <topic.icon className="w-4 h-4 flex-shrink-0" />
                                       <span>{topic.title}</span>
                                   </div>
                                   <ChevronRight className="w-4 h-4 text-zinc-400" />
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="w-2/3 p-6 overflow-y-auto">
                        {selectedTopic ? (
                            <article>
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                                    <selectedTopic.icon className="w-6 h-6 text-zinc-500" />
                                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{selectedTopic.title}</h1>
                                </div>
                                {selectedTopic.content.map(renderContentBlock)}
                            </article>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                <p>{t('general.no_items')}</p>
                            </div>
                        )}
                    </main>
                </div>
                 <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end flex-shrink-0">
                    <Button variant="ghost" onClick={onClose}>{t('general.close')}</Button>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterModal;