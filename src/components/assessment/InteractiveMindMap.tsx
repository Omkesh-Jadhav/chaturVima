import { useState } from 'react';
import { ChevronDown, ChevronRight, Target, Shield, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

/**
 * Interactive Mind Map Component
 * 
 * Displays an expandable/collapsible mind map of recommendation sections.
 * Allows users to explore recommendations in an organized, hierarchical structure.
 */
interface Recommendation {
  title: string;
  description: string;
}

interface RecommendationSection {
  id: number;
  title: string;
  description: string;
  recommendations: Recommendation[];
}

interface MindMapProps {
  sections: RecommendationSection[];
}

const InteractiveMindMap = ({ sections }: MindMapProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleRecommendation = (key: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRecommendations(newExpanded);
  };

  const getSectionIcon = (id: number) => {
    switch (id) {
      case 1: return <Target className="w-5 h-5" />;
      case 2: return <Shield className="w-5 h-5" />;
      case 3: return <TrendingUp className="w-5 h-5" />;
      case 4: return <AlertTriangle className="w-5 h-5" />;
      case 5: return <BarChart3 className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getSectionColor = (id: number) => {
    switch (id) {
      case 1: return 'bg-green-100 border-green-300 text-green-800';
      case 2: return 'bg-orange-100 border-orange-300 text-orange-800';
      case 3: return 'bg-blue-100 border-blue-300 text-blue-800';
      case 4: return 'bg-red-100 border-red-300 text-red-800';
      case 5: return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRecommendationColor = (sectionId: number) => {
    switch (sectionId) {
      case 1: return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 2: return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 3: return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 4: return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 5: return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Recommendation Sections arranged in a single column */}
      <div className="relative">
        <div className="grid grid-cols-1 gap-6">
          {sections.map((section) => (
            <div key={section.id} className="relative">
              {/* Main Section Node */}
              <div
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md ${getSectionColor(section.id)}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSectionIcon(section.id)}
                    <h4 className="font-semibold text-sm">{section.title}</h4>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                <p className="text-xs opacity-80 line-clamp-2">{section.description}</p>
                <div className="mt-2 text-xs font-medium">
                  {section.recommendations.length} recommendations
                </div>
              </div>

              {/* Expanded Recommendations */}
              {expandedSections.has(section.id) && (
                <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {section.recommendations.map((rec, recIndex) => {
                    const recKey = `${section.id}-${recIndex}`;
                    return (
                      <div
                        key={recKey}
                        className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${getRecommendationColor(section.id)}`}
                        onClick={() => toggleRecommendation(recKey)}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm text-gray-800">
                            {recIndex + 1}. {rec.title}
                          </h5>
                          {expandedRecommendations.has(recKey) ? (
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        
                        {expandedRecommendations.has(recKey) && (
                          <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {rec.description}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMindMap;
