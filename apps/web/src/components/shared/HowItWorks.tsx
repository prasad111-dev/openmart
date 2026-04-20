import { Smartphone, ShoppingCart, Truck } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  {
    icon: Smartphone,
    title: 'Open the App',
    description: 'Choose from over 7000 products across groceries, fresh fruits & veggies, beauty items & more.',
  },
  {
    icon: ShoppingCart,
    title: 'Place an Order',
    description: 'Add your favourite items to the cart & avail the best offers on everyday essentials.',
  },
  {
    icon: Truck,
    title: 'Get Free Delivery',
    description: 'Experience lightning-fast speed & get all your items delivered in minutes to your doorstep.',
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export function HowItWorks() {
  return (
    <section className="py-16 bg-card/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
