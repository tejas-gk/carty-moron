'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useEdgeStore } from "@/lib/edgestore"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Plus } from "lucide-react"
import { AiFillCaretDown } from "react-icons/ai"
import { FileState, MultiFileDropzone } from "@/components/image-upload"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Product } from "@/types/productType"
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import Step from "@/components/multi-step";
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { redirect } from "next/navigation"
const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    description: z.string().min(5, 'Description must be at least 5 characters long'),
    price: z
        .union([z.number().positive('Price must be a positive number'), z.string()])
        .nullable(),
    category: z.string().nonempty('Category is required'),
    imageSrc: z.array(z.string()).nullable(),
    colors: z.array(z.string()).nullable(),
    sizes: z.array(z.string()).nullable(),
});

export default function NewProduct({
    categories
}: any) {
    console.log(categories)
    const form = useForm({
        // resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: { id: '' },
            imageSrc: [],
            colors: [],
            sizes: [],
        },
    });
    const [images, setImages] = useState([]);
    const [newColor, setNewColor] = useState<string>('');
    const [newSize, setNewSize] = useState<string>('');
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState('')
    const [formStep, setFormStep] = useState(0)



    const [fileStates, setFileStates] = useState<FileState[]>([]);
    const [uploading, setUploading] = useState(false);

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setFileStates((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find(
                (fileState) => fileState.key === key,
            );
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    const { edgestore } = useEdgeStore();


    function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewColor(event.target.value);
    }

    function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && newColor.trim() !== '') {
            // @ts-ignore
            setColors([...colors, newColor.trim()]);
            setNewColor('');
            event.preventDefault();
        }
    }
    function handleSizeKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && newSize.trim() !== '') {
            setSizes([...sizes, newSize.trim()]);
            setNewSize('');
            event.preventDefault();
        }
    }
    const { toast } = useToast()

    useEffect(() => {
        console.log(form.getValues())
    }, [form.getValues()])


    async function onSubmit() {
        try {
            // productSchema.parse(form.getValues())
            setUploading(true);
            let imageArray: string[] = []
            const uploadedImages = await Promise.all(
                fileStates.map(async (addedFileState) => {
                    try {
                        const res = await edgestore.publicFiles.upload({
                            file: addedFileState.file,
                            onProgressChange: async (progress) => {
                                updateFileProgress(addedFileState.key, progress);
                                if (progress === 100) {
                                    await new Promise((resolve) => setTimeout(resolve, 1000));
                                    updateFileProgress(addedFileState.key, 'COMPLETE');
                                }
                            },
                        })
                        console.log(res, 'unpaid')
                        imageArray.push(res.url)
                        return res
                    } catch (err) {
                        updateFileProgress(addedFileState.key, 'ERROR');
                    }
                })
            );
            setUploading(false);
            const response = await fetch('/api/products', {
                method: 'POST',
                body: JSON.stringify({ ...form.getValues(), images: imageArray, colors, sizes }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            if (response.ok) {
                toast({
                    title: "Product added successfully",
                })
                redirect('/products')
            }
            else {
                toast({
                    title: "Something went wrong",
                    description: data.message,
                    variant: "destructive"
                })
            }
        } catch (err: any) {
            console.log(err.errors)
        }
    }


    function handleSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewSize(event.target.value);
    }
    return (
        <div className='lg:px-64 mt-4'>
            <div className="flex justify-between rounded p-8">
                <Step step={0} currentStep={formStep} />
                <Step step={1} currentStep={formStep} />
                <Step step={2} currentStep={formStep} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add Product</CardTitle>
                    <CardDescription>Add new product</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <motion.div className={cn('space-y-3', {
                                hidden: formStep !== 0
                            })}
                                animate={{
                                    translateX: formStep === 0 ? 0 : '-100%',
                                    opacity: formStep === 0 ? 1 : 0,
                                }}
                                transition={{
                                    ease: 'easeInOut',
                                }}
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the product
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="description" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter Description
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input placeholder="price" {...field}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter Price
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a category"  />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {
                                                            categories.map((category: any) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {category.title}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormDescription>
                                                Enter Category
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="imageSrc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Images</FormLabel>
                                            <FormControl>
                                                <div>
                                                    <MultiFileDropzone
                                                        value={fileStates}
                                                        onChange={(files) => {
                                                            setFileStates(files);
                                                        }}
                                                        onFilesAdded={async (addedFiles) => {
                                                            setFileStates([...fileStates, ...addedFiles]);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Upload Images
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="colors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Colors</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex flex-wrap gap-3">

                                                        {Array.isArray(colors) && colors.map((color: string, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="w-10 h-10 rounded-full"
                                                                style={{ background: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <Input placeholder="color" {...field} value={newColor}
                                                        onChange={handleColorChange}
                                                        onKeyPress={handleKeyPress}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Select a color and click &apos;Add Color&apos;
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sizes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sizes</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex flex-wrap gap-3">
                                                        {sizes.map((size, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center"
                                                            >
                                                                {size}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Input
                                                        placeholder="size"
                                                        {...field}
                                                        value={newSize}
                                                        onChange={handleSizeChange}
                                                        onKeyPress={handleSizeKeyPress}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Enter Size
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="px-8 pb-8">
                                    <div className="mt-10 flex justify-between">
                                        <Button
                                            onClick={() => setFormStep(formStep < 2 ? formStep : formStep - 1)}
                                            variant={formStep === 4 ? "disabled" : "secondary"}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={() => setFormStep(formStep > 4 ? formStep : formStep + 1)}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </div>

                            </motion.div>
                            <motion.div className={cn('space-y-3', {
                                hidden: formStep !== 1
                            })}
                                animate={{
                                    translateX: formStep === 1 ? 0 : '100%',
                                    opacity: formStep === 1 ? 1 : 0,
                                }}
                                transition={{
                                    ease: 'easeInOut',
                                }}
                            >
                                <div className="px-8 pb-8">
                                    {formStep}
                                    <div className="mt-10 flex justify-between">
                                        <Button
                                            onClick={() => setFormStep(formStep - 1)}
                                            variant={formStep === 4 ? "disabled" : "secondary"}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={() => setFormStep(formStep > 4 ? formStep : formStep + 1)}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className={cn('space-y-3', {
                                hidden: formStep !== 2
                            })}
                                animate={{
                                    translateX: formStep === 2 ? 0 : '100%',
                                    opacity: formStep === 2 ? 1 : 0,
                                }}
                                transition={{
                                    ease: 'easeInOut',
                                }}
                            >
                                <div className="mt-10 flex justify-between">
                                    <Button
                                        onClick={() => setFormStep(formStep < 2 ? formStep : formStep - 1)}
                                        variant={formStep === 1 ? "disabled" : "secondary"}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit">Submit</Button>
                                </div>
                            </motion.div>

                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    {/* <p>Card Footer</p> */}
                </CardFooter>
            </Card>
        </div >
    )
}
