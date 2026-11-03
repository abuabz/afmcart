"use client"

import type React from "react"
import { useState, FormEvent } from "react"
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Globe, Award, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/light-header"
import Footer from "@/components/footer"
import Image from "next/image"
import ScrollReveal from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const contactInfo = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Phone",
    details: ["+91 92071 04571"],
    description: "Call us for help with your order",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email",
    details: ["Afmcarts@gmail.com"],
    description: "We'll respond within 24 hours",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Address",
    details: ["Valiyora, Vengara", "Malappuram, Kerala"],
    description: "Visit our store",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Business Hours",
    details: ["Contact us for current hours"],
    description: "We are happy to help",
  },
]

const features = [
  {
    icon: <Award className="w-8 h-8" />,
    title: "Expert Support",
    description: "Our knowledgeable team is here to help with product selection and technical support.",
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Quick Response",
    description: "We pride ourselves on fast response times and excellent customer service.",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Multiple Channels",
    description: "Reach us via phone, email, chat, or visit our store - whatever works best for you.",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Construct WhatsApp message with form data
    const phoneNumber = "919207104571"
    const message = `🌟 New Contact Form Submission 🌟%0A` +
      `👤 Name:    ${encodeURIComponent(formData.name)}%0A` +
      `✉️ Email:   ${encodeURIComponent(formData.email)}%0A` +
      `📞 Phone:   ${encodeURIComponent(formData.phone || 'Not provided')}%0A` +
      `📋 Subject: ${encodeURIComponent(formData.subject)}%0A` +
      `💬 Message: ${encodeURIComponent(formData.message)}%0A`


    // WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank')

    // Reset form after a short delay
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 bg-[#f7fcf7] overflow-hidden">

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal animation="fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-green-100 text-green-800 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-700"></span>
              </span>
              Online Support Available
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-950 mb-8 leading-tight">
              We're Here to <span className="text-green-700">Help You</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you have a question about a gift, toy, jewellery piece, or delivery, our team is ready to help.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-700 text-white hover:bg-green-800 rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-green-900/10 transition-all duration-300 min-w-[180px]"
                onClick={() => window.open('tel:+919207104571', '_self')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-green-200 bg-white text-green-800 hover:bg-green-50 hover:border-green-300 rounded-full px-8 py-6 text-lg font-bold transition-all duration-300 min-w-[180px]"
                onClick={() => window.open('https://wa.me/919207104571', '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Features */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Support?</h2>
            <p className="text-gray-500">We go the extra mile for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} animation="fade-in-up" delay={index * 100} enableReAnimate={false}>
                <Card className="h-full border-gray-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl group text-center">
                  <CardContent className="p-8">
                    <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm text-green-700 mb-6 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-24 px-4 bg-slate-50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-50/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <ScrollReveal animation="fade-in-right" enableReAnimate={false}>
              <div>
                <Badge className="bg-white text-gray-900 border-gray-200 mb-6 px-4 py-1 text-sm shadow-sm">Contact Info</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  We're Here to Help
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-10">
                  Reach out to us through any of the following channels, or visit our store.
                </p>

                <div className="grid grid-cols-1 gap-6">
                  {contactInfo.map((info, index) => (
                    <Card
                      key={index}
                      className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-x-1 rounded-2xl overflow-hidden group"
                    >
                      <CardContent className="p-6 flex items-start gap-5">
                        <div className="bg-slate-50 p-3 rounded-xl text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-800 transition-colors">
                            {info.title}
                          </h3>
                          <div className="space-y-1">
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-gray-700 font-medium">
                                {detail}
                              </p>
                            ))}
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            {info.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal animation="fade-in-left" delay={200} enableReAnimate={false}>
              <Card className="border-0 bg-white shadow-xl rounded-[2rem] overflow-hidden h-full">
                <CardContent className="md:p-10 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                    Send a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 ml-1">Full Name</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-green-700 focus:border-green-700 transition-all font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1">Email Address</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-green-700 focus:border-green-700 transition-all font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1">Phone <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-green-700 focus:border-green-700 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 ml-1">Subject</label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Product Inquiry"
                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-green-700 focus:border-green-700 transition-all font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 ml-1">Message</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="How can we help you today?"
                        rows={5}
                        className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-green-700 focus:border-green-700 transition-all font-medium resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full bg-green-700 text-white hover:bg-green-800 rounded-xl py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Our Store</h2>
            <p className="text-gray-500">Visit us in person.</p>
          </div>

          <ScrollReveal animation="fade-in-up" enableReAnimate={false}>
            <Card className="border-0 shadow-2xl overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-2 h-[500px] relative">
                    <iframe
                      src="https://maps.google.com/maps?q=Valiyora%2C%20Vengara%2C%20Malappuram&t=&z=13&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="AFM Cart location"
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="bg-green-950 text-white p-12 flex flex-col justify-center">
                    <div className="mb-6">
                      <Badge className="bg-green-700 text-white border-0 mb-4">Main Showroom</Badge>
                      <h3 className="text-3xl font-bold mb-2">Visit Us Today</h3>
                      <p className="text-gray-400">Experience our products firsthand.</p>
                    </div>

                    <div className="space-y-6 mb-8">
                      <div className="flex items-start space-x-4">
                        <MapPin className="w-6 h-6 text-green-700 mt-1" />
                        <div>
                          <p className="font-bold text-lg">Address</p>
                          <p className="text-gray-300">Valiyora, Vengara,</p>
                          <p className="text-gray-300">Malappuram, Kerala.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <Clock className="w-6 h-6 text-green-700 mt-1" />
                        <div>
                          <p className="font-bold text-lg">Hours</p>
                          <p className="text-gray-300">Mon-Sat: 9AM - 8PM</p>
                          <p className="text-red-400 font-medium">Sun: Closed</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="bg-white text-green-900 hover:bg-green-100 rounded-full w-full py-6 font-bold shadow-lg transition-transform hover:scale-105"
                      onClick={() => window.open('https://maps.google.com/?q=Valiyora%2C+Vengara%2C+Malappuram', '_blank')}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Common questions from our customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "What are your return policies?",
                answer: "We offer a 30-day return policy on all items in original condition.",
              },
              {
                question: "Do you offer assembly services?",
                answer: "Yes! We provide free assembly service for purchases over ₹49.",
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, Paytm, Gpay and cash for in-store purchases.",
              },
              {
                question: "Do you have a warranty on products?",
                answer: "All our products come with a 1-year manufacturer warranty.",
              },
            ].map((faq, index) => (
              <ScrollReveal key={index} animation="fade-in-up" delay={index * 100} enableReAnimate={false}>
                <Card className="h-full border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 group-hover:text-green-800 transition-colors">{faq.question}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}