
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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
      const response = await fetch(
        "https://lovableproject.supabase.co/functions/v1/generate-study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.geminiApiKey}`,
          },
          body: JSON.stringify({
            ...data,
            subjects: data.subjects.split(',').map(s => s.trim()),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setGeneratedPlan(result.plan);
    } catch (error) {
      console.error("Error generating study plan:", error);
      setError("Failed to generate study plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="form-container slide-in">
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
                <SelectItem value="visual">Visual Learner</SelectItem>
                <SelectItem value="auditory">Auditory Learner</SelectItem>
                <SelectItem value="reading">Reading/Writing Learner</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
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
          <div className="mt-8 p-6 bg-secondary/20 rounded-lg fade-in">
            <h2 className="text-xl font-semibold mb-4">Your Personalized Study Plan</h2>
            <pre className="whitespace-pre-wrap text-sm">{generatedPlan}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
