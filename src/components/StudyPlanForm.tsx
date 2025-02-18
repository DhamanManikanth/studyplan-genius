
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
  subjects: string[];
  examDate: string;
  studyHours: number;
  goals: string;
  learningStyle: string;
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Computer Science",
];

export function StudyPlanForm() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<StudyPlanFormData>();

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const onSubmit = async (data: StudyPlanFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          subjects: selectedSubjects,
        }),
      });

      const result = await response.json();
      setGeneratedPlan(result.plan);
    } catch (error) {
      console.error("Error generating study plan:", error);
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
            <Label className="input-label">Select Subjects</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`subject-tag ${
                    selectedSubjects.includes(subject)
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-secondary/50 text-secondary-foreground border-transparent"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
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
            <Label className="input-label">Study Goals</Label>
            <Textarea
              className="fancy-input min-h-[100px]"
              placeholder="What do you want to achieve?"
              {...register("goals", { required: true })}
            />
          </div>

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
