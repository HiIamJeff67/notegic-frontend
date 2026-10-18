import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export const questionsNavigation = {
  id: "q-and-a",
  title: "Q&A",
  description: "Answers to common Notegic integration questions.",
  weight: 4 as const,
} as const;
const Questions = () => {
  const questions = [
    {
      key: "blockPack",
      question: "What is a Block Pack?",
      answer:
        "A Block Pack is a collaborative document container made from ordered blocks. Use the public API to organize documents and manage access, and Notegic for collaborative editing.",
    },
    {
      key: "apiKeyStorage",
      question: "Where should I store an API key?",
      answer:
        "Store it in a trusted server or CLI secret manager. Do not put it in frontend code, browser storage, URLs, or logs.",
    },
    {
      key: "separateEnvironments",
      question: "Should I use one API key for every environment?",
      answer:
        "No. Create separate keys for development, staging, and production so each environment can be rotated or revoked independently.",
    },
    {
      key: "shelfDifference",
      question: "What is the difference between a Root Shelf and a Sub Shelf?",
      answer:
        "A Root Shelf is a top-level workspace boundary for ownership, membership, and permissions. A Sub Shelf organizes content inside that boundary without creating another workspace.",
    },
    {
      key: "station",
      question: "When should I use a Station?",
      answer:
        "Use a Station when you need an execution-oriented workspace that brings members, permissions, and routines together.",
    },
    {
      key: "routineDifference",
      question: "What is the difference between a Routine and a Routine Task?",
      answer:
        "A Routine defines the automation and schedule. A Routine Task defines one step, including its purpose, payload, and retry settings. Execution results are separate.",
    },
    {
      key: "routineQuota",
      question: "How is Routine Task execution quota calculated?",
      answer:
        "Usage is based on actual task execution time, not on creating or editing a task. Parallel tasks count separately: two tasks running for two minutes each use four task-minutes. Check your account's quota information for current usage and limits.",
    },
    {
      key: "leakedApiKey",
      question: "What should I do if an API key may have leaked?",
      answer:
        "Revoke it immediately, create a replacement key, update the server-side secret, and review logs or deployments for places where the old secret may have been exposed.",
    },
  ];

  return (
    <ArticleSubParagraph id={questionsNavigation.id} separatorFullWidth>
      <ArticleSubParagraphHeader level={0}>Q&amp;A</ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Common questions about Notegic resources and integrations.
        </p>
        <Accordion type="single" collapsible className="w-full">
          {questions.map((item, index) => (
            <AccordionItem key={item.key} value={`question-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="leading-6 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  );
};
export default Questions;
