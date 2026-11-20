"use client";

import { motion } from "motion/react";
import Link from "next/link";

const ctaOptions = [
  {
    title: "Als Betroffener",
    description: "Tragen Sie sich in unsere Warteliste ein",
    buttonText: "Warteliste beitreten",
    buttonColor: "bg-white text-emerald-600 hover:bg-emerald-50",
    href: "/login",
  },
  {
    title: "Als Anwalt",
    description: "Werden Sie Partner-Anwalt",
    buttonText: "Mehr erfahren",
    buttonColor: "bg-white text-blue-700 hover:bg-blue-50",
    href: "/login",
  },
  {
    title: "Als Investor/Partner",
    description: "Sprechen Sie mit uns",
    buttonText: "Kontakt aufnehmen",
    buttonColor: "bg-white text-emerald-600 hover:bg-emerald-50",
    href: "/login",
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Interesse an Schulden.PRO?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {ctaOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <h3 className="text-xl font-bold mb-3">{option.title}</h3>
              <p className="text-blue-100 mb-6">{option.description}</p>
              <Link
                href={option.href}
                className={`${option.buttonColor} px-6 py-3 rounded-lg font-semibold transition-all duration-300 w-full shadow-md hover:shadow-lg block text-center`}
              >
                {option.buttonText}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
