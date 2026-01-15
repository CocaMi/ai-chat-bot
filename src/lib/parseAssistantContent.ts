export type ParsedDocument = {
  filename: string;
  dmsId: string;
};

export type ParsedRelatedQuestion = string;

export function parseAssistantContent(raw: string) {
  let content = raw;
  const documents: ParsedDocument[] = [];
  const relatedQuestions: ParsedRelatedQuestion[] = [];

  // Parse <documents>
  const docMatch = content.match(/<documents>([\s\S]*?)<\/documents>/);
  if (docMatch) {
    const lines = docMatch[1].split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const [file, dmsId] = line.split("|").map(s => s.trim());
      if (file && dmsId && file.endsWith(".pdf")) {
        documents.push({
          filename: file.replace(/\.pdf$/i, ""),
          dmsId
        });
      }
    }
    content = content.replace(docMatch[0], "").trim();
  }

  // Parse <related_questions>
  const rqMatch = content.match(/<related_questions>([\s\S]*?)<\/related_questions>/);
  if (rqMatch) {
    const lines = rqMatch[1].split("\n").map(l => l.trim()).filter(Boolean);
    relatedQuestions.push(...lines);
    content = content.replace(rqMatch[0], "").trim();
  }

  return { content, documents, relatedQuestions };
}
