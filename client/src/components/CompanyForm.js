import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function CompanyForm({ onCompanyAdd }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5555/categories')
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCategories(data.map(category => category.name)); 
                }
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            link: '',
            indeed: '',
            category_name: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Company name is required'),
            link: Yup.string()
                .url('Linkedin link must start with "https://www.linkedin.com/company/"')
                .matches(/^https:\/\/www\.linkedin\.com\/company\//, 'Linkedin link must start with "https://www.linkedin.com/company/"')
                .required('Linkedin link is required'),
            indeed: Yup.string()
                .url('Indeed link must start with "https://www.indeed.com/cmp/"')
                .matches(/^https:\/\/www\.indeed\.com\/cmp\//, 'Indeed link must start with "https://www.indeed.com/cmp/"')
                .required('Indeed link is required'),
            category_name: Yup.string().required('Category is required'),
        }),
        onSubmit: (values, { setSubmitting, setFieldError }) => {
            if (!categories.includes(values.category_name)) {
                setFieldError('category_name', 'Category does not exist');
                setSubmitting(false);
                return;
            }

            fetch('http://127.0.0.1:5555/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        onCompanyAdd(data);
                        formik.resetForm();
                    } else {
                        setFieldError('category_name', 'Category must exist');
                    }
                })
                .catch((error) => {
                    console.log(error);
                    setFieldError('category_name', 'An error occurred while adding the company');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        },
    });

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <div className="form-container">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Company Name"
                            {...formik.getFieldProps('name')}
                            className="input"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="error-message">{formik.errors.name}</div>
                        )}
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Company Link"
                            {...formik.getFieldProps('link')}
                            className="input"
                        />
                        {formik.touched.link && formik.errors.link && (
                            <div className="error-message">{formik.errors.link}</div>
                        )}
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Indeed Link"
                            {...formik.getFieldProps('indeed')}
                            className="input"
                        />
                        {formik.touched.indeed && formik.errors.indeed && (
                            <div className="error-message">{formik.errors.indeed}</div>
                        )}
                    </div>

                    <div className="input-wrapper">
                        <select
                            name="category_name"
                            {...formik.getFieldProps('category_name')}
                            className="input"
                        >
                            <option value="">Select a Category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {formik.touched.category_name && formik.errors.category_name && (
                            <div className="error-message">{formik.errors.category_name}</div>
                        )}
                    </div>
                </div>

                <button type="submit" className="button" disabled={formik.isSubmitting}>
                    Add Company
                </button>
            </form>
        </div>
    );
}

export default CompanyForm;
