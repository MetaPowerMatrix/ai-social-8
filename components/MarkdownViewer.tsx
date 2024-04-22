import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
	markdownText: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdownText }) => {
	return (
		<div>
			<ReactMarkdown remarkPlugins={[remarkGfm]}>
				{markdownText}
			</ReactMarkdown>
		</div>
	);
}

export default MarkdownViewer;
