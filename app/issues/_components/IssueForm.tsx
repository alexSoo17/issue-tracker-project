"use client";
import {ErrorMessage, Spinner} from "@/app/components";
import {issueSchema} from "@/app/validationSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Issue} from "@prisma/client";
import {Button, Callout, TextField} from "@radix-ui/themes";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import SimpleMDE from "react-simplemde-editor";
import {z} from "zod";

type IssueFormData = z.infer<typeof issueSchema>;

const IssueForm = ({issue}: { issue?: Issue }) => {
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const {
        register,
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<IssueFormData>({
        resolver: zodResolver(issueSchema),
    });

    const onSubmit = handleSubmit(async (data) => {
        try {
            setIsSubmitting(true);
            issue
                ? await axios.patch(`/api/issues/${issue.id}`, data)
                : await axios.post("/api/issues", data);
            router.push("/issues");
            router.refresh();
        } catch (err) {
            setError("Unexpected error...");
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <div className="max-w-lg">
            {error && (
                <Callout.Root color="red" className="mb-3">
                    <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
            )}
            <form className="space-y-3" onSubmit={onSubmit}>
                <TextField.Root>
                    <TextField.Input
                        placeholder="Title"
                        defaultValue={issue?.title}
                        {...register("title")}
                    />
                </TextField.Root>
                <ErrorMessage>{errors.title?.message}</ErrorMessage>
                <Controller
                    name="description"
                    control={control}
                    defaultValue={issue?.description}
                    render={({field: {ref, ...field}}) => (
                        <SimpleMDE placeholder="Description" {...field} />
                    )}
                />
                <ErrorMessage>{errors.description?.message}</ErrorMessage>
                <Button type="submit" disabled={isSubmitting}>
                    {issue ? "Update Issue" : "Submit New Issue"}{" "}
                    {isSubmitting && <Spinner/>}
                </Button>
            </form>
        </div>
    );
};

export default IssueForm;
