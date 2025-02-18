
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import ReactMarkdown from 'react-markdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface StudyPlanFormData {
  subjects: string;
  examDate: string;
  studyHours: number;
  goals: string;
  learningStyle: string;
  strengths: string;
  weaknesses: string;
  geminiApiKey: string;
}

export function StudyPlanForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<StudyPlanFormData>();

  const onSubmit = async (data: StudyPlanFormData) => {
    setIsLoading(true);
    setError("");
    try {
      // Remove 'Bearer ' if it's included in the API key
      const apiKey = data.geminiApiKey.replace('Bearer ', '');
      
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please generate a detailed study plan and format the response in markdown syntax. Here are the details:

# Study Plan Details
- Subjects: ${data.subjects}
- Exam Date: ${data.examDate}
- Daily Study Hours: ${data.studyHours}
- Learning Style: ${data.learningStyle}
- Strengths: ${data.strengths}
- Weaknesses: ${data.weaknesses}
- Goals: ${data.goals}

Please create a comprehensive study schedule that includes:

1. Distribution of study hours across subjects
2. Learning activities based on the specified learning style
3. Breaks and revision periods
4. Measurable milestones
5. Timeline adaptation for the exam
6. Strategies leveraging strengths
7. Plans to improve weak areas

FORMAT THE ENTIRE RESPONSE IN MARKDOWN SYNTAX with proper headings, lists, and emphasis where appropriate.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 2048,
            },
            safetySettings: [{
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Error: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        setGeneratedPlan(result.candidates[0].content.parts[0].text);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      setError(error.message || "Failed to generate study plan. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-center mb-8">
          Create Your Study Plan
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="input-group">
            <Label className="input-label">Enter Subjects</Label>
            <Input
              type="text"
              className="fancy-input"
              placeholder="Enter subjects separated by commas (e.g., Math, Physics, Chemistry)"
              {...register("subjects", { required: true })}
            />
            {errors.subjects && (
              <span className="text-red-500 text-sm">Please enter at least one subject</span>
            )}
          </div>

          <div className="input-group">
            <Label className="input-label">Exam Date</Label>
            <Input
              type="date"
              className="fancy-input"
              {...register("examDate", { required: true })}
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Daily Study Hours</Label>
            <Input
              type="number"
              min="1"
              max="24"
              className="fancy-input"
              {...register("studyHours", { required: true, min: 1, max: 24 })}
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Learning Style</Label>
            <Select {...register("learningStyle")}>
              <SelectTrigger className="fancy-input">
                <SelectValue placeholder="Select your learning style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Watching Educational Videos</SelectItem>
                <SelectItem value="reading">Reading Books and Notes</SelectItem>
                <SelectItem value="practice">Practice and Problem Solving</SelectItem>
                <SelectItem value="interactive">Interactive Learning Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="input-group">
            <Label className="input-label">Your Strengths</Label>
            <Textarea
              className="fancy-input"
              placeholder="What are your academic strengths?"
              {...register("strengths", { required: true })}
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Your Weaknesses</Label>
            <Textarea
              className="fancy-input"
              placeholder="What areas do you need to improve?"
              {...register("weaknesses", { required: true })}
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Study Goals</Label>
            <Textarea
              className="fancy-input min-h-[100px]"
              placeholder="What do you want to achieve?"
              {...register("goals", { required: true })}
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Gemini API Key</Label>
            <Input
              type="password"
              className="fancy-input"
              placeholder="Enter your Gemini API Key"
              {...register("geminiApiKey", { required: true })}
            />
            {errors.geminiApiKey && (
              <span className="text-red-500 text-sm">API key is required</span>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Generating Plan..." : "Generate Study Plan"}
          </Button>
        </form>

        {generatedPlan && (
          <div className="mt-8 p-6 bg-secondary/20 rounded-lg fade-in prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold mb-4">Your Personalized Study Plan</h2>
            <div className="markdown-content">
              <ReactMarkdown 
                className="prose prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4"
              >
                {generatedPlan}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
